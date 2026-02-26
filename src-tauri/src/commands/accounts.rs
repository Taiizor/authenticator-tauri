use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, State};

use crate::models::account::{Account, AccountView, Algorithm, OtpType};
use crate::otp::totp;
use crate::state::AppState;
use crate::storage::vault;

#[tauri::command]
pub fn get_accounts(state: State<'_, Mutex<AppState>>) -> Result<Vec<AccountView>, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    Ok(s.accounts.iter().map(|a| a.to_view()).collect())
}

#[tauri::command]
pub fn add_account(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    name: String,
    secret: String,
    otp_type: OtpType,
    digits: u32,
    period: u32,
    algorithm: Algorithm,
    issuer: Option<String>,
    category: Option<String>,
    icon: Option<String>,
    color: Option<String>,
) -> Result<AccountView, String> {
    if name.trim().is_empty() {
        return Err("Account name is required".to_string());
    }
    if digits < 4 || digits > 10 {
        return Err("Digits must be between 4 and 10".to_string());
    }
    if period == 0 || period > 3600 {
        return Err("Period must be between 1 and 3600".to_string());
    }

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let sort_order = s.accounts.len() as i32;

    let counter = match otp_type {
        OtpType::Hotp => Some(0u64),
        OtpType::Totp => None,
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
        category,
        icon,
        color,
        sort_order,
        created_at: now,
    };

    let view = account.to_view();
    s.accounts.push(account);

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(view)
}

#[tauri::command]
pub fn update_account(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    id: String,
    name: Option<String>,
    issuer: Option<String>,
    secret: Option<String>,
    category: Option<String>,
    icon: Option<String>,
    color: Option<String>,
) -> Result<AccountView, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let account = s
        .accounts
        .iter_mut()
        .find(|a| a.id == id)
        .ok_or_else(|| format!("Account not found: {}", id))?;

    if let Some(name) = name {
        account.name = name;
    }
    if let Some(issuer) = issuer {
        account.issuer = Some(issuer);
    }
    if let Some(secret) = secret {
        account.secret = secret;
    }
    if let Some(category) = category {
        account.category = Some(category);
    }
    if let Some(icon) = icon {
        account.icon = Some(icon);
    }
    if let Some(color) = color {
        account.color = Some(color);
    }

    let view = account.to_view();

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(view)
}

#[tauri::command]
pub fn delete_account(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<bool, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let original_len = s.accounts.len();
    s.accounts.retain(|a| a.id != id);

    if s.accounts.len() == original_len {
        return Ok(false); // Account not found
    }

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(true)
}

#[tauri::command]
pub fn reorder_accounts(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    ids: Vec<String>,
) -> Result<bool, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    for (index, id) in ids.iter().enumerate() {
        if let Some(account) = s.accounts.iter_mut().find(|a| &a.id == id) {
            account.sort_order = index as i32;
        }
    }

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(true)
}

#[tauri::command]
pub fn validate_secret(secret: String) -> bool {
    totp::validate_secret(&secret)
}
