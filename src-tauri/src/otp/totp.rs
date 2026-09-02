use totp_rs::{Algorithm as TotpAlgorithm, Builder, Secret, Totp};

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

    let cleaned_secret = account.secret.replace(' ', "").to_uppercase();
    let secret = Secret::try_from_base32(&cleaned_secret)
        .map_err(|e| format!("Invalid secret: {}", e))?;

    let mut builder = Builder::new()
        .with_algorithm(to_totp_algorithm(&account.algorithm))
        .with_digits(account.digits as u8)
        .with_skew(1)
        .with_step_duration(account.period as u64)
        .with_secret(secret);

    if let Some(issuer) = &account.issuer {
        builder = builder.with_issuer(Some(issuer.as_str()));
    }
    builder = builder.with_account_name(account.name.as_str());

    let totp = builder.build_noncompliant();
    let code = totp.generate_current().to_string();

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
    if period == 0 {
        return 0;
    }
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
    Secret::try_from_base32(&cleaned).is_ok()
}

/// Returns the canonical algorithm string used in otpauth:// URIs.
pub fn algorithm_str(algo: &Algorithm) -> &'static str {
    match algo {
        Algorithm::SHA1 => "SHA1",
        Algorithm::SHA256 => "SHA256",
        Algorithm::SHA512 => "SHA512",
    }
}

/// Builds an otpauth:// URI from an Account.
/// Format follows the Key URI Format spec:
/// <https://github.com/google/google-authenticator/wiki/Key-Uri-Format>
pub fn account_to_otpauth_uri(account: &Account) -> String {
    let scheme = match account.otp_type {
        OtpType::Totp => "totp",
        OtpType::Hotp => "hotp",
    };

    let label = match &account.issuer {
        Some(issuer) if !issuer.is_empty() => format!(
            "{}:{}",
            urlencoding::encode(issuer),
            urlencoding::encode(&account.name)
        ),
        _ => urlencoding::encode(&account.name).into_owned(),
    };

    let secret = account.secret.replace(' ', "").to_uppercase();
    let mut params = vec![
        format!("secret={}", secret),
        format!("algorithm={}", algorithm_str(&account.algorithm)),
        format!("digits={}", account.digits),
    ];

    if let Some(issuer) = &account.issuer {
        if !issuer.is_empty() {
            params.push(format!("issuer={}", urlencoding::encode(issuer)));
        }
    }

    match account.otp_type {
        OtpType::Totp => {
            params.push(format!("period={}", account.period));
        }
        OtpType::Hotp => {
            params.push(format!("counter={}", account.counter.unwrap_or(0)));
        }
    }

    format!("otpauth://{}/{}?{}", scheme, label, params.join("&"))
}

/// Normalizes the `secret` query parameter in an otpauth:// URI.
/// Base32 is case-insensitive per RFC 4648, but `totp-rs` requires upper-case,
/// non-padded input. Some providers (e.g. Google) emit lower-case secrets,
/// and users sometimes paste secrets with spaces or padding.
fn normalize_otpauth_uri(uri: &str) -> String {
    let Some(q_idx) = uri.find('?') else {
        return uri.to_string();
    };
    let (base, query) = uri.split_at(q_idx + 1);
    let normalized: Vec<String> = query
        .split('&')
        .map(|param| match param.split_once('=') {
            Some((key, value)) if key.eq_ignore_ascii_case("secret") => {
                let cleaned: String = value
                    .chars()
                    .filter(|c| !c.is_whitespace() && *c != '=')
                    .collect::<String>()
                    .to_uppercase();
                format!("{}={}", key, cleaned)
            }
            _ => param.to_string(),
        })
        .collect();
    format!("{}{}", base, normalized.join("&"))
}

/// Parses an otpauth:// URI into an Account
pub fn parse_otpauth_uri(uri: &str) -> Result<Account, String> {
    let normalized = normalize_otpauth_uri(uri);
    let totp = Totp::from_url_unchecked(&normalized)
        .map_err(|e| format!("Invalid otpauth URI: {}", e))?;

    let algorithm = match totp.algorithm() {
        TotpAlgorithm::SHA1 => Algorithm::SHA1,
        TotpAlgorithm::SHA256 => Algorithm::SHA256,
        TotpAlgorithm::SHA512 => Algorithm::SHA512,
        #[allow(unreachable_patterns)]
        _ => Algorithm::SHA1,
    };

    let secret_encoded = totp.secret().to_base32();

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

    let counter = if otp_type == OtpType::Hotp {
        uri.split('?')
            .nth(1)
            .and_then(|q| q.split('&').find(|p| p.starts_with("counter=")))
            .and_then(|p| p.strip_prefix("counter="))
            .and_then(|v| v.parse::<u64>().ok())
            .or(Some(0))
    } else {
        None
    };

    Ok(Account {
        id: uuid::Uuid::new_v4().to_string(),
        name: totp.account_name().to_string(),
        issuer: totp.issuer().map(|s| s.to_string()),
        secret: secret_encoded,
        otp_type,
        digits: totp.digits() as u32,
        period: totp.step() as u32,
        algorithm,
        counter,
        category: None,
        icon: None,
        color: None,
        sort_order: 0,
        created_at: now,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_secret() {
        assert!(validate_secret("JBSWY3DPEHPK3PXP"));
        assert!(validate_secret("jbsw y3dp ehpk 3pxp"));
        assert!(!validate_secret("invalid!base32?"));
    }

    #[test]
    fn test_generate_totp() {
        let account = Account {
            id: "test-id".to_string(),
            name: "user@example.com".to_string(),
            issuer: Some("Example".to_string()),
            secret: "JBSWY3DPEHPK3PXP".to_string(),
            otp_type: OtpType::Totp,
            digits: 6,
            period: 30,
            algorithm: Algorithm::SHA1,
            counter: None,
            category: None,
            icon: None,
            color: None,
            sort_order: 0,
            created_at: 0,
        };

        let res = generate_totp(&account);
        assert!(res.is_ok());
        let code_res = res.unwrap();
        assert_eq!(code_res.code.len(), 6);
        assert!(code_res.code.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn test_parse_otpauth_uri() {
        let uri = "otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30";
        let res = parse_otpauth_uri(uri);
        assert!(res.is_ok());
        let account = res.unwrap();
        assert_eq!(account.name, "user@example.com");
        assert_eq!(account.issuer, Some("Example".to_string()));
        assert_eq!(account.secret, "JBSWY3DPEHPK3PXP");
        assert_eq!(account.digits, 6);
        assert_eq!(account.period, 30);
        assert_eq!(account.algorithm, Algorithm::SHA1);
    }
}
