use hmac::{Hmac, KeyInit, Mac};
use sha1::Sha1;
use sha2::{Sha256, Sha512};

use crate::models::account::{Account, Algorithm, CodeResponse, OtpType};

/// Generates an HOTP code for an account at its current counter value
pub fn generate_hotp(account: &Account) -> Result<CodeResponse, String> {
    if account.otp_type != OtpType::Hotp {
        return Err("Account is not HOTP type".to_string());
    }

    let counter = account.counter.unwrap_or(0);
    let secret_bytes = base32::decode(
        base32::Alphabet::Rfc4648 { padding: false },
        &account.secret.replace(' ', "").to_uppercase(),
    )
    .ok_or_else(|| "Invalid Base32 secret".to_string())?;

    let code = compute_hotp(&secret_bytes, counter, &account.algorithm, account.digits)?;

    Ok(CodeResponse {
        id: account.id.clone(),
        code,
        remaining: 0, // HOTP doesn't have time remaining
        period: 0,
    })
}

/// Computes HOTP using HMAC-SHA algorithm (RFC 4226)
fn compute_hotp(
    secret: &[u8],
    counter: u64,
    algorithm: &Algorithm,
    digits: u32,
) -> Result<String, String> {
    let counter_bytes = counter.to_be_bytes();

    let hash = hmac_sha(secret, &counter_bytes, algorithm)?;

    // Dynamic truncation (RFC 4226 Section 5.3)
    let offset = (hash[hash.len() - 1] & 0x0f) as usize;
    let binary = ((hash[offset] & 0x7f) as u32) << 24
        | (hash[offset + 1] as u32) << 16
        | (hash[offset + 2] as u32) << 8
        | (hash[offset + 3] as u32);

    let modulus = 10u32.pow(digits);
    let otp = binary % modulus;

    Ok(format!("{:0>width$}", otp, width = digits as usize))
}

/// Computes HMAC using the specified SHA algorithm
fn hmac_sha(key: &[u8], data: &[u8], algo: &Algorithm) -> Result<Vec<u8>, String> {
    match algo {
        Algorithm::SHA1 => {
            let mut mac = Hmac::<Sha1>::new_from_slice(key)
                .map_err(|e| format!("HMAC-SHA1 key error: {}", e))?;
            mac.update(data);
            Ok(mac.finalize().into_bytes().to_vec())
        }
        Algorithm::SHA256 => {
            let mut mac = Hmac::<Sha256>::new_from_slice(key)
                .map_err(|e| format!("HMAC-SHA256 key error: {}", e))?;
            mac.update(data);
            Ok(mac.finalize().into_bytes().to_vec())
        }
        Algorithm::SHA512 => {
            let mut mac = Hmac::<Sha512>::new_from_slice(key)
                .map_err(|e| format!("HMAC-SHA512 key error: {}", e))?;
            mac.update(data);
            Ok(mac.finalize().into_bytes().to_vec())
        }
    }
}
