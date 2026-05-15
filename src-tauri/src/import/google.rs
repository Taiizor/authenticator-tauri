use crate::models::account::{Account, Algorithm, OtpType};
use crate::proto as migration_proto;
use base32::Alphabet;
use prost::Message;
use std::time::{SystemTime, UNIX_EPOCH};

/// Parses a Google Authenticator migration export.
///
/// The input `data` should be the raw string content from a QR code that contains
/// an `otpauth-migration://offline?data=BASE64_ENCODED_PROTOBUF` URI.
pub fn parse_google_auth(data: &[u8]) -> Result<Vec<Account>, String> {
    let uri_str = std::str::from_utf8(data)
        .map_err(|e| format!("Invalid UTF-8 in migration data: {}", e))?;

    // Extract the base64-encoded data parameter from the migration URI
    let encoded_data = extract_data_param(uri_str)?;

    // URL-decode the base64 data (it may contain %2B, %2F, %3D etc.)
    let decoded_url =
        urlencoding::decode(&encoded_data).map_err(|e| format!("URL decode error: {}", e))?;

    // Base64 decode
    use base64::Engine;
    let proto_bytes = base64::engine::general_purpose::STANDARD
        .decode(decoded_url.as_bytes())
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    // Parse protobuf
    let payload = migration_proto::MigrationPayload::decode(proto_bytes.as_slice())
        .map_err(|e| format!("Protobuf decode error: {}", e))?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let mut accounts = Vec::new();

    for otp in payload.otp_parameters {
        // Convert raw secret bytes to Base32
        let secret = base32::encode(Alphabet::Rfc4648 { padding: false }, &otp.secret);

        // Map protobuf Algorithm enum to our Algorithm
        let algorithm = match otp.algorithm {
            2 => Algorithm::SHA256,
            3 => Algorithm::SHA512,
            _ => Algorithm::SHA1, // 0 (unspecified) and 1 (SHA1) both default to SHA1
        };

        // Map protobuf DigitCount enum to digits
        let digits = match otp.digits {
            2 => 8, // DIGIT_COUNT_EIGHT
            _ => 6, // 0 (unspecified) and 1 (six) both default to 6
        };

        // Map protobuf OtpType enum to our OtpType
        let otp_type = match otp.r#type {
            1 => OtpType::Hotp,
            _ => OtpType::Totp, // 0 (unspecified) and 2 (TOTP) both default to TOTP
        };

        // Parse name - Google Auth stores "issuer:name" in the name field
        let (parsed_name, parsed_issuer) = parse_google_name(&otp.name, &otp.issuer);

        let counter = if otp_type == OtpType::Hotp {
            Some(otp.counter as u64)
        } else {
            None
        };

        let account = Account {
            id: uuid::Uuid::new_v4().to_string(),
            name: parsed_name,
            issuer: parsed_issuer,
            secret,
            otp_type,
            digits,
            period: 30, // Google Auth always uses 30s
            algorithm,
            counter,
            category: None,
            icon: None,
            color: None,
            sort_order: accounts.len() as i32,
            created_at: now,
        };

        accounts.push(account);
    }

    Ok(accounts)
}

/// Extracts the `data` parameter from an otpauth-migration:// URI.
fn extract_data_param(uri: &str) -> Result<String, String> {
    // Handle the URI format: otpauth-migration://offline?data=...
    let query_start = uri
        .find('?')
        .ok_or_else(|| "No query parameters in migration URI".to_string())?;

    let query = &uri[query_start + 1..];

    for param in query.split('&') {
        if let Some(value) = param.strip_prefix("data=") {
            return Ok(value.to_string());
        }
    }

    Err("No 'data' parameter found in migration URI".to_string())
}

/// Parses Google Authenticator name format.
/// Google Auth often stores names as "issuer:account" in the name field.
fn parse_google_name(name: &str, issuer: &str) -> (String, Option<String>) {
    let issuer_opt = if issuer.is_empty() {
        None
    } else {
        Some(issuer.to_string())
    };

    // If name contains "issuer:account", extract just the account part
    if let Some(colon_pos) = name.find(':') {
        let prefix = name[..colon_pos].trim();
        let account = name[colon_pos + 1..].trim();

        // Use the account part as the name
        let final_name = if account.is_empty() {
            name.to_string()
        } else {
            account.to_string()
        };

        // If no issuer was provided, use the prefix as the issuer
        let final_issuer = if issuer_opt.is_some() {
            issuer_opt
        } else {
            Some(prefix.to_string())
        };

        (final_name, final_issuer)
    } else {
        (name.to_string(), issuer_opt)
    }
}
