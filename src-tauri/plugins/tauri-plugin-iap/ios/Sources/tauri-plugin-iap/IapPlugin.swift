import StoreKit
import SwiftRs
import Tauri
import UIKit
import WebKit

// The one-time "full version" unlock: a non-consumable In-App Purchase read
// through StoreKit 2. The JS side (`src/use/useFullVersion.ts`) owns the
// policy (the gate, the cached entitlement); this file only talks to the
// store.
//
//   • entitlement = a VERIFIED, non-revoked transaction for the product id in
//     `Transaction.currentEntitlements` (StoreKit answers it from the local
//     transaction cache too, so it works offline once bought);
//   • every verified transaction is finished, including those that arrive
//     outside the app (Ask to Buy approvals, a purchase on another device,
//     refunds) through the `Transaction.updates` listener, which emits
//     `entitlement-changed`;
//   • the price is `Product.displayPrice`, the storefront's own string.

private let fullVersionProductId = "com.hyperg8.battlecross.fullversion"

class IapPlugin: Plugin {
    private var updatesTask: Task<Void, Never>?

    // Tauri calls this once the webview exists; the updates listener must run
    // for the whole life of the app (StoreKit asks for it at launch).
    @objc public override func load(webview: WKWebView) {
        startListening()
    }

    private func startListening() {
        guard updatesTask == nil else { return }
        updatesTask = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self = self else { return }
                if case .verified(let transaction) = update, transaction.productID == fullVersionProductId {
                    await transaction.finish()
                    let entitled = await self.isEntitled()
                    self.trigger("entitlement-changed", data: ["entitled": entitled])
                }
                // An unverified update is dropped: never unlock on it.
            }
        }
    }

    private func isEntitled() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == fullVersionProductId,
               transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }

    private func loadProduct() async throws -> Product? {
        let products = try await Product.products(for: [fullVersionProductId])
        return products.first
    }

    @objc public func getProduct(_ invoke: Invoke) throws {
        startListening()
        Task {
            do {
                guard let product = try await self.loadProduct() else {
                    invoke.resolve([
                        "supported": true,
                        "id": fullVersionProductId,
                        "error": "product-not-found",
                    ])
                    return
                }
                invoke.resolve([
                    "supported": true,
                    "id": product.id,
                    "price": product.displayPrice,
                    "displayName": product.displayName,
                ])
            } catch {
                invoke.resolve([
                    "supported": true,
                    "id": fullVersionProductId,
                    "error": error.localizedDescription,
                ])
            }
        }
    }

    @objc public func purchase(_ invoke: Invoke) throws {
        startListening()
        Task {
            do {
                guard let product = try await self.loadProduct() else {
                    invoke.resolve([
                        "supported": true, "status": "failed", "entitled": false,
                        "error": "product-not-found",
                    ])
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        let entitled = transaction.revocationDate == nil
                        invoke.resolve([
                            "supported": true, "status": "purchased", "entitled": entitled,
                        ])
                    case .unverified(_, let verificationError):
                        invoke.resolve([
                            "supported": true, "status": "failed", "entitled": false,
                            "error": verificationError.localizedDescription,
                        ])
                    }
                case .pending:
                    // Ask to Buy / strong customer authentication: the result
                    // arrives later through `Transaction.updates`.
                    invoke.resolve(["supported": true, "status": "pending", "entitled": false])
                case .userCancelled:
                    invoke.resolve(["supported": true, "status": "cancelled", "entitled": false])
                @unknown default:
                    invoke.resolve([
                        "supported": true, "status": "failed", "entitled": false,
                        "error": "unknown-result",
                    ])
                }
            } catch {
                invoke.resolve([
                    "supported": true, "status": "failed", "entitled": false,
                    "error": error.localizedDescription,
                ])
            }
        }
    }

    // The review-required "Restore Purchases": ask the App Store to sync the
    // account's transactions (may prompt for the Apple ID), then read the
    // entitlement. `checked: false` = the store could not be reached.
    @objc public func restore(_ invoke: Invoke) throws {
        startListening()
        Task {
            do {
                try await AppStore.sync()
                let entitled = await self.isEntitled()
                invoke.resolve(["supported": true, "checked": true, "entitled": entitled])
            } catch {
                // A cancelled Apple ID prompt or no network: fall back to the
                // transactions already on the device.
                let entitled = await self.isEntitled()
                invoke.resolve([
                    "supported": true, "checked": entitled, "entitled": entitled,
                    "error": error.localizedDescription,
                ])
            }
        }
    }

    @objc public func getEntitlement(_ invoke: Invoke) throws {
        startListening()
        Task {
            let entitled = await self.isEntitled()
            invoke.resolve(["supported": true, "checked": true, "entitled": entitled])
        }
    }
}

@_cdecl("init_plugin_iap")
func initPlugin() -> Plugin {
    return IapPlugin()
}
