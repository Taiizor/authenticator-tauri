use crate::models::account::{Account, Algorithm, OtpType};
use std::time::{SystemTime, UNIX_EPOCH};

/// Parses a CSV file into a list of Accounts.
///
/// Expected CSV columns (header row required):
/// - `name` (required): Account name
/// - `secret` (required): Base32-encoded secret key
/// - `type` (optional): "totp" or "hotp", defaults to "totp"
/// - `digits` (optional): Number of digits, defaults to 6
/// - `period` (optional): Period in seconds, defaults to 30
/// - `algorithm` (optional): "SHA1", "SHA256", or "SHA512", defaults to "SHA1"
/// - `issuer` (optional): Issuer name
/// - `counter` (optional): HOTP counter value
pub fn parse_csv(data: &[u8]) -> Result<Vec<Account>, String> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .flexible(true)
        .trim(csv::Trim::All)
        .from_reader(data);

    let headers = reader
        .headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?
        .clone();

    // Find column indices by header name (case-insensitive)
    let col_name = find_column(&headers, "name");
    let col_secret = find_column(&headers, "secret");
    let col_type = find_column(&headers, "type");
    let col_digits = find_column(&headers, "digits");
    let col_period = find_column(&headers, "period");
    let col_algorithm = find_column(&headers, "algorithm");
    let col_issuer = find_column(&headers, "issuer");
    let col_counter = find_column(&headers, "counter");
    let col_category = find_column(&headers, "category");
    let col_icon = find_column(&headers, "icon");
    let col_color = find_column(&headers, "color");

    // name and secret columns are required
    let col_name =
        col_name.ok_or_else(|| "CSV missing required 'name' column".to_string())?;
    let col_secret =
        col_secret.ok_or_else(|| "CSV missing required 'secret' column".to_string())?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let mut accounts = Vec::new();

    for (row_idx, result) in reader.records().enumerate() {
        let record =
            result.map_err(|e| format!("CSV parse error at row {}: {}", row_idx + 1, e))?;

        let name = get_field(&record, Some(col_name)).unwrap_or_default();
        let secret = get_field(&record, Some(col_secret)).unwrap_or_default();

        // Skip rows with empty name or secret
        if name.is_empty() || secret.is_empty() {
            continue;
        }

        let otp_type = match get_field(&record, col_type)
            .unwrap_or_default()
            .to_lowercase()
            .as_str()
        {
            "hotp" => OtpType::Hotp,
            _ => OtpType::Totp,
        };

        let digits = get_field(&record, col_digits)
            .and_then(|v| v.parse::<u32>().ok())
            .unwrap_or(6);

        let period = get_field(&record, col_period)
            .and_then(|v| v.parse::<u32>().ok())
            .unwrap_or(30);

        let algorithm = match get_field(&record, col_algorithm)
            .unwrap_or_default()
            .to_uppercase()
            .as_str()
        {
            "SHA256" => Algorithm::SHA256,
            "SHA512" => Algorithm::SHA512,
            _ => Algorithm::SHA1,
        };

        let issuer = get_field(&record, col_issuer).filter(|s| !s.is_empty());

        let counter = if otp_type == OtpType::Hotp {
            Some(
                get_field(&record, col_counter)
                    .and_then(|v| v.parse::<u64>().ok())
                    .unwrap_or(0),
            )
        } else {
            None
        };

        let account = Account {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            issuer,
            secret,
            otp_type,
            digits,
            period,
            algorithm,
            counter,
            category: get_field(&record, col_category),
            icon: get_field(&record, col_icon),
            color: get_field(&record, col_color),
            sort_order: accounts.len() as i32,
            created_at: now,
        };

        accounts.push(account);
    }

    Ok(accounts)
}

/// Find a column index by name (case-insensitive).
fn find_column(headers: &csv::StringRecord, name: &str) -> Option<usize> {
    let name_lower = name.to_lowercase();
    headers
        .iter()
        .position(|h| h.trim().to_lowercase() == name_lower)
}

/// Get a trimmed field value from a record by column index.
fn get_field(record: &csv::StringRecord, col: Option<usize>) -> Option<String> {
    col.and_then(|i| record.get(i))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}
