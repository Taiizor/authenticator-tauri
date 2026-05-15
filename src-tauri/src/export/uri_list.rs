use crate::models::account::Account;
use crate::otp::totp::account_to_otpauth_uri;

/// Serializes accounts as one otpauth:// URI per line.
/// The output is plain UTF-8 text suitable for `.txt` files.
pub fn serialize_uri_list(accounts: &[Account]) -> Result<Vec<u8>, String> {
    let mut out = String::new();
    for a in accounts {
        out.push_str(&account_to_otpauth_uri(a));
        out.push('\n');
    }
    Ok(out.into_bytes())
}
