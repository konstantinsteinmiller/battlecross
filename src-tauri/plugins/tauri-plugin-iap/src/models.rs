use serde::{Deserialize, Serialize};

/// The product id of the one-time "full version" unlock (non-consumable).
pub const FULL_VERSION_PRODUCT_ID: &str = "com.hyperg8.battlecross.fullversion";

/// What `get_product` answers. `price` is the storefront's own formatted
/// string (StoreKit `displayPrice`), never a hard-coded currency.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductResponse {
    pub supported: bool,
    pub id: String,
    pub price: Option<String>,
    pub display_name: Option<String>,
    pub error: Option<String>,
}

/// What `purchase` answers. `status`: `purchased` | `pending` (Ask to Buy,
/// SCA) | `cancelled` | `failed` | `unsupported`.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PurchaseResponse {
    pub supported: bool,
    pub status: String,
    pub entitled: bool,
    pub error: Option<String>,
}

/// What `restore` and `get_entitlement` answer. `checked` is false when the
/// store could not be asked (offline): the caller must then keep its cache.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntitlementResponse {
    pub supported: bool,
    pub checked: bool,
    pub entitled: bool,
    pub error: Option<String>,
}
