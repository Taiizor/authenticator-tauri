use crate::models::account::{Account, Algorithm, OtpType};
use serde::Deserialize;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
struct EnteExport {
    items: Vec<EnteItem>,
}

#[derive(Deserialize)]
struct EnteItem {
    issuer: Option<String>,
    account: Option<String>,
    secret: String,
    #[serde(rename = "type")]
    otp_type: Option<String>,
    digits: Option<u32>,
    period: Option<u32>,
    algorithm: Option<String>,
    counter: Option<u64>,
    // Custom round-trip extensions (ignored by official Ente Auth).
    #[serde(default)]
    color: Option<String>,
    #[serde(default)]
    icon: Option<String>,
    #[serde(default)]
    category: Option<String>,
}

/// Parses an Ente Auth JSON export into a list of Accounts.
///
/// Ente Auth exports can be either:
/// 1. A JSON object with `items` array containing structured entries
/// 2. A JSON array of otpauth:// URIs (handled as fallback)
pub fn parse_ente(data: &[u8]) -> Result<Vec<Account>, String> {
    // First, try parsing as structured Ente format with items
    if let Ok(export) = serde_json::from_slice::<EnteExport>(data) {
        return parse_ente_items(&export.items);
    }

    // Fallback: try parsing as a JSON array of otpauth:// URI strings
    if let Ok(uris) = serde_json::from_slice::<Vec<String>>(data) {
        return parse_ente_uris(&uris);
    }

    Err("Invalid Ente Auth JSON: could not parse as items or URI list".to_string())
}

fn parse_ente_items(items: &[EnteItem]) -> Result<Vec<Account>, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let mut accounts = Vec::new();

    for item in items {
        let otp_type = match item
            .otp_type
            .as_deref()
            .unwrap_or("totp")
            .to_lowercase()
            .as_str()
        {
            "hotp" => OtpType::Hotp,
            _ => OtpType::Totp,
        };

        let algorithm = match item
            .algorithm
            .as_deref()
            .unwrap_or("sha1")
            .to_uppercase()
            .as_str()
        {
            "SHA256" => Algorithm::SHA256,
            "SHA512" => Algorithm::SHA512,
            _ => Algorithm::SHA1,
        };

        let counter = if otp_type == OtpType::Hotp {
            item.counter.or(Some(0))
        } else {
            None
        };

        // Use account name, fall back to issuer, then "Unknown"
        let name = item
            .account
            .clone()
            .or_else(|| item.issuer.clone())
            .unwrap_or_else(|| "Unknown".to_string());

        let account = Account {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            issuer: item.issuer.clone(),
            secret: item.secret.clone(),
            otp_type,
            digits: item.digits.unwrap_or(6),
            period: item.period.unwrap_or(30),
            algorithm,
            counter,
            category: item.category.clone(),
            icon: item.icon.clone(),
            color: item.color.clone(),
            sort_order: accounts.len() as i32,
            created_at: now,
        };

        accounts.push(account);
    }

    Ok(accounts)
}

fn parse_ente_uris(uris: &[String]) -> Result<Vec<Account>, String> {
    let mut accounts = Vec::new();

    for uri in uris {
        let trimmed = uri.trim();
        if trimmed.is_empty() {
            continue;
        }
        match crate::otp::totp::parse_otpauth_uri(trimmed) {
            Ok(account) => accounts.push(account),
            Err(e) => {
                eprintln!("Skipping invalid Ente URI: {}", e);
            }
        }
    }

    Ok(accounts)
}
