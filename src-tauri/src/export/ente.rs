use crate::models::account::{Account, OtpType};
use crate::otp::totp::algorithm_str;
use serde_json::json;

/// Serializes accounts to an Ente Auth plain JSON export.
pub fn serialize_ente(accounts: &[Account]) -> Result<Vec<u8>, String> {
    let items: Vec<serde_json::Value> = accounts
        .iter()
        .map(|a| {
            let otp_type = match a.otp_type {
                OtpType::Totp => "totp",
                OtpType::Hotp => "hotp",
            };

            let mut item = json!({
                "issuer": a.issuer,
                "account": a.name,
                "secret": a.secret.replace(' ', "").to_uppercase(),
                "type": otp_type,
                "digits": a.digits,
                "period": a.period,
                "algorithm": algorithm_str(&a.algorithm),
                "color": a.color,
                "icon": a.icon,
                "category": a.category,
            });

            if a.otp_type == OtpType::Hotp {
                item["counter"] = json!(a.counter.unwrap_or(0));
            }

            item
        })
        .collect();

    let payload = json!({ "items": items });
    serde_json::to_vec_pretty(&payload).map_err(|e| format!("Ente serialize error: {}", e))
}
