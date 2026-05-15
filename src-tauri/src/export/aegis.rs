use crate::models::account::{Account, OtpType};
use crate::otp::totp::algorithm_str;
use serde_json::json;

/// Serializes accounts to an Aegis Authenticator plain (unencrypted) JSON export.
/// See: <https://github.com/beemdevelopment/Aegis/blob/master/docs/vault.md>
pub fn serialize_aegis(accounts: &[Account]) -> Result<Vec<u8>, String> {
    let entries: Vec<serde_json::Value> = accounts
        .iter()
        .map(|a| {
            let entry_type = match a.otp_type {
                OtpType::Totp => "totp",
                OtpType::Hotp => "hotp",
            };

            let mut info = json!({
                "secret": a.secret.replace(' ', "").to_uppercase(),
                "algo": algorithm_str(&a.algorithm),
                "digits": a.digits,
            });

            match a.otp_type {
                OtpType::Totp => {
                    info["period"] = json!(a.period);
                }
                OtpType::Hotp => {
                    info["counter"] = json!(a.counter.unwrap_or(0));
                }
            }

            json!({
                "type": entry_type,
                "uuid": a.id,
                "name": a.name,
                "issuer": a.issuer.clone().unwrap_or_default(),
                "note": "",
                "icon": serde_json::Value::Null,
                "group": a.category,
                "info": info,
                "color": a.color,
                "icon_name": a.icon,
            })
        })
        .collect();

    let payload = json!({
        "version": 1,
        "header": {
            "slots": serde_json::Value::Null,
            "params": serde_json::Value::Null,
        },
        "db": {
            "version": 2,
            "entries": entries,
        }
    });

    serde_json::to_vec_pretty(&payload).map_err(|e| format!("Aegis serialize error: {}", e))
}
