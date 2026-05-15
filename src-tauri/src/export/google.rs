use crate::models::account::{Account, Algorithm, OtpType};
use crate::proto::{MigrationPayload, OtpParameters};
use base32::Alphabet;
use base64::Engine;
use prost::Message;

const DEFAULT_BATCH_SIZE: usize = 10;

/// Encodes a list of accounts into one or more `otpauth-migration://offline?data=...` URIs.
///
/// Each URI corresponds to a single QR code. Large vaults are split into batches
/// of `batch_size` accounts (defaults to 10) to keep individual QR codes scannable.
pub fn serialize_google_migration(
    accounts: &[Account],
    batch_size: Option<usize>,
) -> Result<Vec<String>, String> {
    if accounts.is_empty() {
        return Ok(Vec::new());
    }

    let batch_size = batch_size.unwrap_or(DEFAULT_BATCH_SIZE).max(1);
    let chunks: Vec<&[Account]> = accounts.chunks(batch_size).collect();
    let total = chunks.len() as i32;
    let batch_id = (rand::random::<u32>() & 0x7fff_ffff) as i32;

    let mut uris = Vec::with_capacity(chunks.len());

    for (idx, chunk) in chunks.iter().enumerate() {
        let otp_parameters: Result<Vec<OtpParameters>, String> =
            chunk.iter().map(account_to_proto_param).collect();
        let otp_parameters = otp_parameters?;

        let payload = MigrationPayload {
            otp_parameters,
            version: 1,
            batch_size: total,
            batch_index: idx as i32,
            batch_id,
        };

        let mut bytes = Vec::with_capacity(payload.encoded_len());
        payload
            .encode(&mut bytes)
            .map_err(|e| format!("Protobuf encode error: {}", e))?;

        let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
        let encoded = urlencoding::encode(&b64);
        uris.push(format!("otpauth-migration://offline?data={}", encoded));
    }

    Ok(uris)
}

fn account_to_proto_param(account: &Account) -> Result<OtpParameters, String> {
    let secret_clean = account.secret.replace(' ', "").to_uppercase();
    let secret_bytes = base32::decode(Alphabet::Rfc4648 { padding: false }, &secret_clean)
        .ok_or_else(|| format!("Invalid Base32 secret for account '{}'", account.name))?;

    // Raw enum values per proto: ALGORITHM_SHA1=1, SHA256=2, SHA512=3
    let algorithm: i32 = match account.algorithm {
        Algorithm::SHA1 => 1,
        Algorithm::SHA256 => 2,
        Algorithm::SHA512 => 3,
    };

    // DIGIT_COUNT_SIX=1, DIGIT_COUNT_EIGHT=2
    let digits: i32 = if account.digits == 8 { 2 } else { 1 };

    // OTP_TYPE_HOTP=1, OTP_TYPE_TOTP=2
    let r#type: i32 = match account.otp_type {
        OtpType::Hotp => 1,
        OtpType::Totp => 2,
    };

    let issuer = account.issuer.clone().unwrap_or_default();
    let name = if !issuer.is_empty() {
        format!("{}:{}", issuer, account.name)
    } else {
        account.name.clone()
    };

    let counter = account.counter.unwrap_or(0) as i64;

    Ok(OtpParameters {
        secret: secret_bytes,
        name,
        issuer,
        algorithm,
        digits,
        r#type,
        counter,
    })
}
