use std::sync::Mutex;

use tauri::{AppHandle, State};

use crate::models::account::{CodeResponse, OtpType};
use crate::otp::hotp;
use crate::otp::totp;
use crate::state::AppState;
use crate::storage::vault;

#[tauri::command]
pub fn get_all_codes(state: State<'_, Mutex<AppState>>) -> Result<Vec<CodeResponse>, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let mut codes = Vec::new();

    for account in &s.accounts {
        let code = match account.otp_type {
            OtpType::Totp => totp::generate_totp(account)?,
            OtpType::Hotp => hotp::generate_hotp(account)?,
        };
        codes.push(code);
    }

    Ok(codes)
}

#[tauri::command]
pub fn increment_hotp(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<CodeResponse, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let account = s
        .accounts
        .iter_mut()
        .find(|a| a.id == id)
        .ok_or_else(|| format!("Account not found: {}", id))?;

    if account.otp_type != OtpType::Hotp {
        return Err("Account is not HOTP type".to_string());
    }

    // Increment the counter
    let current = account.counter.unwrap_or(0);
    account.counter = Some(current + 1);

    // Generate the new code with the incremented counter
    let code = hotp::generate_hotp(account)?;

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(code)
}
