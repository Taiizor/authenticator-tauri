use crate::models::account::{Account, Algorithm, OtpType};
use serde::Deserialize;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
struct TwoFasExport {
    services: Vec<TwoFasService>,
    #[serde(default)]
    groups: Vec<TwoFasGroup>,
}

#[derive(Deserialize)]
struct TwoFasService {
    name: String,
    secret: String,
    otp: TwoFasOtp,
    #[serde(rename = "groupId")]
    group_id: Option<String>,
    // Custom round-trip extensions (ignored by official 2FAS).
    #[serde(default)]
    color: Option<String>,
    #[serde(default, rename = "iconName")]
    icon_name: Option<String>,
}

#[derive(Deserialize)]
struct TwoFasOtp {
    issuer: Option<String>,
    #[allow(dead_code)]
    account: Option<String>,
    digits: Option<u32>,
    period: Option<u32>,
    algorithm: Option<String>,
    #[serde(rename = "tokenType")]
    token_type: Option<String>,
    counter: Option<u64>,
}

#[derive(Deserialize)]
struct TwoFasGroup {
    id: String,
    name: String,
}

/// Parses a 2FAS JSON export into a list of Accounts.
pub fn parse_twofas(data: &[u8]) -> Result<Vec<Account>, String> {
    let export: TwoFasExport =
        serde_json::from_slice(data).map_err(|e| format!("Invalid 2FAS JSON: {}", e))?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    // Build a lookup map from group ID to group name
    let group_map: HashMap<String, String> = export
        .groups
        .into_iter()
        .map(|g| (g.id, g.name))
        .collect();

    let mut accounts = Vec::new();

    for service in export.services {
        let otp_type = match service
            .otp
            .token_type
            .as_deref()
            .unwrap_or("TOTP")
            .to_uppercase()
            .as_str()
        {
            "HOTP" => OtpType::Hotp,
            _ => OtpType::Totp,
        };

        let algorithm = match service
            .otp
            .algorithm
            .as_deref()
            .unwrap_or("SHA1")
            .to_uppercase()
            .as_str()
        {
            "SHA256" => Algorithm::SHA256,
            "SHA512" => Algorithm::SHA512,
            _ => Algorithm::SHA1,
        };

        let counter = if otp_type == OtpType::Hotp {
            service.otp.counter.or(Some(0))
        } else {
            None
        };

        // Resolve group name from group ID
        let category = service
            .group_id
            .as_ref()
            .and_then(|gid| group_map.get(gid))
            .cloned();

        let account = Account {
            id: uuid::Uuid::new_v4().to_string(),
            name: service.name,
            issuer: service.otp.issuer,
            secret: service.secret,
            otp_type,
            digits: service.otp.digits.unwrap_or(6),
            period: service.otp.period.unwrap_or(30),
            algorithm,
            counter,
            category,
            icon: service.icon_name,
            color: service.color,
            sort_order: accounts.len() as i32,
            created_at: now,
        };

        accounts.push(account);
    }

    Ok(accounts)
}
