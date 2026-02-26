use crate::models::account::Account;

/// Parses an otpauth:// URI into an Account.
/// Delegates to the existing URI parser in the OTP module.
pub fn parse_uri(uri: &str) -> Result<Account, String> {
    crate::otp::totp::parse_otpauth_uri(uri)
}
