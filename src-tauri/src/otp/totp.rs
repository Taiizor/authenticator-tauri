use totp_rs::{Algorithm as TotpAlgorithm, Secret, TOTP};

use crate::models::account::{Account, Algorithm, CodeResponse, OtpType};
use std::time::{SystemTime, UNIX_EPOCH};

/// Converts our Algorithm enum to totp-rs Algorithm
fn to_totp_algorithm(algo: &Algorithm) -> TotpAlgorithm {
    match algo {
        Algorithm::SHA1 => TotpAlgorithm::SHA1,
        Algorithm::SHA256 => TotpAlgorithm::SHA256,
        Algorithm::SHA512 => TotpAlgorithm::SHA512,
    }
}

/// Generates the current TOTP code for an account
pub fn generate_totp(account: &Account) -> Result<CodeResponse, String> {
    if account.otp_type != OtpType::Totp {
        return Err("Account is not TOTP type".to_string());
    }

    let secret_bytes = Secret::Encoded(account.secret.clone())
        .to_bytes()
        .map_err(|e| format!("Invalid secret: {}", e))?;

    let totp = TOTP::new(
        to_totp_algorithm(&account.algorithm),
        account.digits as usize,
        1, // skew
        account.period as u64,
        secret_bytes,
        account.issuer.clone(),
        account.name.clone(),
    )
    .map_err(|e| format!("TOTP creation error: {}", e))?;

    let code = totp
        .generate_current()
        .map_err(|e| format!("TOTP generation error: {}", e))?;

    let remaining = remaining_seconds(account.period);

    Ok(CodeResponse {
        id: account.id.clone(),
        code,
        remaining,
        period: account.period,
    })
}

/// Calculates remaining seconds in current TOTP period
pub fn remaining_seconds(period: u32) -> u32 {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let elapsed = now % (period as u64);
    (period as u64 - elapsed) as u32
}

/// Validates a Base32-encoded secret key
pub fn validate_secret(secret: &str) -> bool {
    let cleaned = secret.replace(' ', "").to_uppercase();
    Secret::Encoded(cleaned).to_bytes().is_ok()
}

/// Parses an otpauth:// URI into an Account
pub fn parse_otpauth_uri(uri: &str) -> Result<Account, String> {
    let totp =
        TOTP::from_url(uri).map_err(|e| format!("Invalid otpauth URI: {}", e))?;

    let algorithm = match totp.algorithm {
        TotpAlgorithm::SHA1 => Algorithm::SHA1,
        TotpAlgorithm::SHA256 => Algorithm::SHA256,
        TotpAlgorithm::SHA512 => Algorithm::SHA512,
        #[allow(unreachable_patterns)]
        _ => Algorithm::SHA1,
    };

    let secret_encoded = Secret::Raw(totp.secret.clone()).to_encoded().to_string();

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    // Determine if HOTP or TOTP from URI scheme
    let otp_type = if uri.starts_with("otpauth://hotp") {
        OtpType::Hotp
    } else {
        OtpType::Totp
    };

    Ok(Account {
        id: uuid::Uuid::new_v4().to_string(),
        name: totp.account_name.clone(),
        issuer: totp.issuer.clone(),
        secret: secret_encoded,
        otp_type,
        digits: totp.digits as u32,
        period: totp.step as u32,
        algorithm,
        counter: None,
        category: None,
        icon: None,
        color: None,
        sort_order: 0,
        created_at: now,
    })
}
