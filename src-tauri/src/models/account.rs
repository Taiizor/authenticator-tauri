use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum OtpType {
    Totp,
    Hotp,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Algorithm {
    SHA1,
    SHA256,
    SHA512,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub name: String,
    pub issuer: Option<String>,
    pub secret: String,
    pub otp_type: OtpType,
    pub digits: u32,
    pub period: u32,
    pub algorithm: Algorithm,
    pub counter: Option<u64>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub sort_order: i32,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct AccountView {
    pub id: String,
    pub name: String,
    pub issuer: Option<String>,
    pub otp_type: OtpType,
    pub digits: u32,
    pub period: u32,
    pub algorithm: Algorithm,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct CodeResponse {
    pub id: String,
    pub code: String,
    pub remaining: u32,
    pub period: u32,
}

impl Account {
    pub fn to_view(&self) -> AccountView {
        AccountView {
            id: self.id.clone(),
            name: self.name.clone(),
            issuer: self.issuer.clone(),
            otp_type: self.otp_type.clone(),
            digits: self.digits,
            period: self.period,
            algorithm: self.algorithm.clone(),
            category: self.category.clone(),
            icon: self.icon.clone(),
            color: self.color.clone(),
            sort_order: self.sort_order,
        }
    }
}
