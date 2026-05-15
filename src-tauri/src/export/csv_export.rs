use crate::models::account::{Account, OtpType};
use crate::otp::totp::algorithm_str;

/// Serializes accounts to a CSV file with the canonical column order:
/// `name,secret,type,digits,period,algorithm,issuer,counter`
pub fn serialize_csv(accounts: &[Account]) -> Result<Vec<u8>, String> {
    let mut writer = csv::WriterBuilder::new()
        .has_headers(true)
        .from_writer(Vec::new());

    writer
        .write_record([
            "name",
            "secret",
            "type",
            "digits",
            "period",
            "algorithm",
            "issuer",
            "counter",
            "category",
            "icon",
            "color",
        ])
        .map_err(|e| format!("CSV header write error: {}", e))?;

    for a in accounts {
        let otp_type = match a.otp_type {
            OtpType::Totp => "totp",
            OtpType::Hotp => "hotp",
        };
        let counter = match a.otp_type {
            OtpType::Hotp => a.counter.unwrap_or(0).to_string(),
            OtpType::Totp => String::new(),
        };

        writer
            .write_record([
                a.name.as_str(),
                &a.secret.replace(' ', "").to_uppercase(),
                otp_type,
                &a.digits.to_string(),
                &a.period.to_string(),
                algorithm_str(&a.algorithm),
                a.issuer.as_deref().unwrap_or(""),
                &counter,
                a.category.as_deref().unwrap_or(""),
                a.icon.as_deref().unwrap_or(""),
                a.color.as_deref().unwrap_or(""),
            ])
            .map_err(|e| format!("CSV write error: {}", e))?;
    }

    writer
        .into_inner()
        .map_err(|e| format!("CSV finalize error: {}", e))
}
