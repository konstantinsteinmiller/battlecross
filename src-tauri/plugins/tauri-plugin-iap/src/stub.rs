use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Iap<R>> {
    Ok(Iap(app.clone()))
}

/// Android and desktop: there is no purchase here (the game is fully free),
/// every call answers `supported: false` and the JS gate stays off.
pub struct Iap<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Iap<R> {
    pub fn get_product(&self) -> crate::Result<ProductResponse> {
        Ok(ProductResponse {
            id: FULL_VERSION_PRODUCT_ID.into(),
            ..Default::default()
        })
    }

    pub fn purchase(&self) -> crate::Result<PurchaseResponse> {
        Ok(PurchaseResponse {
            status: "unsupported".into(),
            ..Default::default()
        })
    }

    pub fn restore(&self) -> crate::Result<EntitlementResponse> {
        Ok(EntitlementResponse::default())
    }

    pub fn get_entitlement(&self) -> crate::Result<EntitlementResponse> {
        Ok(EntitlementResponse::default())
    }
}
