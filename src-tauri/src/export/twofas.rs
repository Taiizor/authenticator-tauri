use crate::models::account::{Account, OtpType};
use crate::otp::totp::algorithm_str;
use serde_json::json;
use std::collections::BTreeMap;

/// Serializes accounts to a 2FAS Authenticator plain JSON export.
pub fn serialize_twofas(accounts: &[Account]) -> Result<Vec<u8>, String> {
    // Build deterministic group list from category names.
    let mut category_to_id: BTreeMap<String, String> = BTreeMap::new();
    for a in accounts {
        if let Some(cat) = &a.category {
            if !cat.is_empty() && !category_to_id.contains_key(cat) {
                let id = uuid::Uuid::new_v4().to_string();
                category_to_id.insert(cat.clone(), id);
            }
        }
    }

    let groups: Vec<serde_json::Value> = category_to_id
        .iter()
        .map(|(name, id)| json!({ "id": id, "name": name }))
        .collect();

    let services: Vec<serde_json::Value> = accounts
        .iter()
        .enumerate()
        .map(|(idx, a)| {
            let token_type = match a.otp_type {
                OtpType::Totp => "TOTP",
                OtpType::Hotp => "HOTP",
            };

            let mut otp = json!({
                "issuer": a.issuer.clone().unwrap_or_default(),
                "account": a.name,
                "digits": a.digits,
                "period": a.period,
                "algorithm": algorithm_str(&a.algorithm),
                "tokenType": token_type,
            });

            if a.otp_type == OtpType::Hotp {
                otp["counter"] = json!(a.counter.unwrap_or(0));
            }

            let group_id = a
                .category
                .as_ref()
                .and_then(|c| category_to_id.get(c).cloned());

            json!({
                "name": a.name,
                "secret": a.secret.replace(' ', "").to_uppercase(),
                "groupId": group_id,
                "otp": otp,
                "order": { "position": idx },
                "color": a.color,
                "iconName": a.icon,
            })
        })
        .collect();

    let payload = json!({
        "schemaVersion": 4,
        "groups": groups,
        "services": services,
    });

    serde_json::to_vec_pretty(&payload).map_err(|e| format!("2FAS serialize error: {}", e))
}
