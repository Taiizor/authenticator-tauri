use crate::models::account::{Account, Algorithm, OtpType};
use serde::Deserialize;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
struct AegisExport {
    db: AegisDb,
}

#[derive(Deserialize)]
struct AegisDb {
    entries: Vec<AegisEntry>,
}

#[derive(Deserialize)]
struct AegisEntry {
    #[serde(rename = "type")]
    entry_type: String,
    name: String,
    issuer: Option<String>,
    group: Option<String>,
    info: AegisInfo,
    // Custom round-trip extensions (ignored by official Aegis).
    #[serde(default)]
    color: Option<String>,
    #[serde(default, rename = "icon_name")]
    icon_name: Option<String>,
}

#[derive(Deserialize)]
struct AegisInfo {
    secret: String,
    algo: Option<String>,
    digits: Option<u32>,
    period: Option<u32>,
    counter: Option<u64>,
}

/// Parses an Aegis Authenticator JSON export into a list of Accounts.
pub fn parse_aegis(data: &[u8]) -> Result<Vec<Account>, String> {
    let export: AegisExport =
        serde_json::from_slice(data).map_err(|e| format!("Invalid Aegis JSON: {}", e))?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let mut accounts = Vec::new();

    for entry in export.db.entries {
        let otp_type = match entry.entry_type.to_lowercase().as_str() {
            "hotp" => OtpType::Hotp,
            "totp" => OtpType::Totp,
            other => {
                // Skip unsupported types (e.g. steam, yandex)
                eprintln!("Skipping unsupported Aegis entry type: {}", other);
                continue;
            }
        };

        let algorithm = match entry
            .info
            .algo
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
            entry.info.counter.or(Some(0))
        } else {
            None
        };

        let account = Account {
            id: uuid::Uuid::new_v4().to_string(),
            name: entry.name,
            issuer: entry.issuer,
            secret: entry.info.secret,
            otp_type,
            digits: entry.info.digits.unwrap_or(6),
            period: entry.info.period.unwrap_or(30),
            algorithm,
            counter,
            category: entry.group,
            icon: entry.icon_name,
            color: entry.color,
            sort_order: accounts.len() as i32,
            created_at: now,
        };

        accounts.push(account);
    }

    Ok(accounts)
}
