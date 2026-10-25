// Tauri plugin for the one-time "full version" In-App Purchase.
//
// Design:
//   • iOS registers a native StoreKit 2 implementation (`IapPlugin.swift`,
//     `init_plugin_iap`). It listens to `Transaction.updates`, finishes every
//     verified transaction and answers the entitlement from
//     `Transaction.currentEntitlements`.
//   • Android and desktop get an inert Rust stub: no native code is added to
//     the Android build at all, every call answers `supported: false`.
//
// Commands (JS invoke names use `snake_case`, native methods `camelCase`):
//   • plugin:iap|get_product      → product id + the storefront's price string
//   • plugin:iap|purchase         → the purchase sheet
//   • plugin:iap|restore          → AppStore.sync() + entitlement
//   • plugin:iap|get_entitlement  → entitlement only
// Event: `entitlement-changed` ({ entitled }) from `Transaction.updates`.

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

mod commands;
mod error;
mod models;

#[cfg(target_os = "ios")]
mod ios;
#[cfg(not(target_os = "ios"))]
mod stub;

pub use error::{Error, Result};

#[cfg(target_os = "ios")]
use ios::Iap;
#[cfg(not(target_os = "ios"))]
use stub::Iap;

pub trait IapExt<R: Runtime> {
    fn iap(&self) -> &Iap<R>;
}

impl<R: Runtime, T: Manager<R>> crate::IapExt<R> for T {
    fn iap(&self) -> &Iap<R> {
        self.state::<Iap<R>>().inner()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("iap")
        .invoke_handler(tauri::generate_handler![
            commands::get_product,
            commands::purchase,
            commands::restore,
            commands::get_entitlement,
        ])
        .setup(|app, api| {
            #[cfg(target_os = "ios")]
            let iap = ios::init(app, api)?;
            #[cfg(not(target_os = "ios"))]
            let iap = stub::init(app, api)?;
            app.manage(iap);
            Ok(())
        })
        .build()
}
