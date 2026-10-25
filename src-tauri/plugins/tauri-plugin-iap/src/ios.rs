use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::*;

tauri::ios_plugin_binding!(init_plugin_iap);

pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<Iap<R>> {
    let handle = api.register_ios_plugin(init_plugin_iap)?;
    Ok(Iap(handle))
}

/// Handle to the native StoreKit 2 plugin (`IapPlugin.swift`). Method names
/// are camelCase to match the `@objc` Swift selectors.
pub struct Iap<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Iap<R> {
    /// The full-version product: its id and the storefront's price string.
    pub fn get_product(&self) -> crate::Result<ProductResponse> {
        self.0.run_mobile_plugin("getProduct", ()).map_err(Into::into)
    }

    /// Opens the App Store purchase sheet.
    pub fn purchase(&self) -> crate::Result<PurchaseResponse> {
        self.0.run_mobile_plugin("purchase", ()).map_err(Into::into)
    }

    /// `AppStore.sync()`, then the entitlement (the review-required button).
    pub fn restore(&self) -> crate::Result<EntitlementResponse> {
        self.0.run_mobile_plugin("restore", ()).map_err(Into::into)
    }

    /// A verified, non-revoked transaction in `Transaction.currentEntitlements`.
    pub fn get_entitlement(&self) -> crate::Result<EntitlementResponse> {
        self.0.run_mobile_plugin("getEntitlement", ()).map_err(Into::into)
    }
}
