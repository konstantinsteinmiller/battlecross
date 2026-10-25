use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::IapExt;
use crate::Result;

#[command]
pub(crate) async fn get_product<R: Runtime>(app: AppHandle<R>) -> Result<ProductResponse> {
    app.iap().get_product()
}

#[command]
pub(crate) async fn purchase<R: Runtime>(app: AppHandle<R>) -> Result<PurchaseResponse> {
    app.iap().purchase()
}

#[command]
pub(crate) async fn restore<R: Runtime>(app: AppHandle<R>) -> Result<EntitlementResponse> {
    app.iap().restore()
}

#[command]
pub(crate) async fn get_entitlement<R: Runtime>(app: AppHandle<R>) -> Result<EntitlementResponse> {
    app.iap().get_entitlement()
}
