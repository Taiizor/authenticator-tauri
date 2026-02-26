use std::fs;
use std::sync::Mutex;

use tauri::{AppHandle, State};

use crate::crypto::backup;
use crate::import;
use crate::models::account::AccountView;
use crate::state::AppState;
use crate::storage::vault;

#[tauri::command]
pub fn import_from_uri(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    uri: String,
) -> Result<AccountView, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let mut account = import::parse_uri(&uri)?;

    // Assign sort_order based on current account count
    account.sort_order = s.accounts.len() as i32;

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
pub fn import_from_qr_image(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    path: String,
) -> Result<Vec<AccountView>, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let qr_content = import::read_qr_image(&path)?;

    let mut new_accounts = if qr_content.starts_with("otpauth-migration://") {
        // Google Authenticator migration format
        import::parse_google_auth(qr_content.as_bytes())?
    } else if qr_content.starts_with("otpauth://") {
        // Standard otpauth URI
        let account = import::parse_uri(&qr_content)?;
        vec![account]
    } else {
        return Err(format!("Unrecognized QR code content: {}", qr_content));
    };

    // Assign sort_order values based on current account count
    let base_order = s.accounts.len() as i32;
    for (i, account) in new_accounts.iter_mut().enumerate() {
        account.sort_order = base_order + i as i32;
    }

    let views: Vec<AccountView> = new_accounts.iter().map(|a| a.to_view()).collect();
    s.accounts.extend(new_accounts);

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(views)
}

#[tauri::command]
pub fn import_from_file(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    path: String,
    format: String,
) -> Result<Vec<AccountView>, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let data = fs::read(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))?;

    let mut new_accounts = match format.as_str() {
        "aegis" => import::parse_aegis(&data)?,
        "twofas" => import::parse_twofas(&data)?,
        "ente" => import::parse_ente(&data)?,
        "google" => import::parse_google_auth(&data)?,
        "csv" => import::parse_csv(&data)?,
        _ => return Err(format!("Unsupported import format: {}", format)),
    };

    // Assign sort_order values based on current account count
    let base_order = s.accounts.len() as i32;
    for (i, account) in new_accounts.iter_mut().enumerate() {
        account.sort_order = base_order + i as i32;
    }

    let views: Vec<AccountView> = new_accounts.iter().map(|a| a.to_view()).collect();
    s.accounts.extend(new_accounts);

    let password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &password)?;

    Ok(views)
}

#[tauri::command]
pub fn export_backup(
    _app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    path: String,
    password: String,
) -> Result<bool, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let backup_data = backup::create_backup(&s.accounts, &password)?;

    fs::write(&path, &backup_data)
        .map_err(|e| format!("Failed to write backup file '{}': {}", path, e))?;

    Ok(true)
}

#[tauri::command]
pub fn import_backup(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    path: String,
    password: String,
) -> Result<Vec<AccountView>, String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let data =
        fs::read(&path).map_err(|e| format!("Failed to read backup file '{}': {}", path, e))?;

    let mut restored_accounts = backup::restore_backup(&data, &password)?;

    // Assign sort_order values based on current account count
    let base_order = s.accounts.len() as i32;
    for (i, account) in restored_accounts.iter_mut().enumerate() {
        account.sort_order = base_order + i as i32;
    }

    let views: Vec<AccountView> = restored_accounts.iter().map(|a| a.to_view()).collect();
    s.accounts.extend(restored_accounts);

    let vault_password = s
        .password
        .clone()
        .ok_or_else(|| "No password set".to_string())?;
    vault::save_vault(&app, &s.accounts, &vault_password)?;

    Ok(views)
}

#[tauri::command]
pub fn export_plain(
    state: State<'_, Mutex<AppState>>,
    path: String,
    password: String,
) -> Result<bool, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let current_password = s
        .password
        .as_deref()
        .ok_or_else(|| "No password set".to_string())?;
    if password != current_password {
        return Err("Invalid password".to_string());
    }

    let json = serde_json::to_string_pretty(&s.accounts)
        .map_err(|e| format!("Serialization error: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write export file '{}': {}", path, e))?;

    Ok(true)
}
