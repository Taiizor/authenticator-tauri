use std::fs;
use std::path::Path;
use std::sync::Mutex;

use tauri::{AppHandle, State};

use crate::crypto::backup;
use crate::export;
use crate::import;
use crate::models::account::AccountView;
use crate::otp::totp::{account_to_otpauth_uri, parse_otpauth_uri};
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

/// Exports all accounts to a file in the requested format.
/// Supported formats: "aegis", "twofas", "ente", "csv", "uri_list".
#[tauri::command]
pub fn export_to_file(
    state: State<'_, Mutex<AppState>>,
    path: String,
    format: String,
) -> Result<bool, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;
    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let bytes = match format.as_str() {
        "aegis" => export::serialize_aegis(&s.accounts)?,
        "twofas" => export::serialize_twofas(&s.accounts)?,
        "ente" => export::serialize_ente(&s.accounts)?,
        "csv" => export::serialize_csv(&s.accounts)?,
        "uri_list" => export::serialize_uri_list(&s.accounts)?,
        other => return Err(format!("Unsupported export format: {}", other)),
    };

    fs::write(&path, bytes)
        .map_err(|e| format!("Failed to write export file '{}': {}", path, e))?;

    Ok(true)
}

/// Returns the otpauth:// URI for a single account by id.
#[tauri::command]
pub fn export_account_uri(
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<String, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;
    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let account = s
        .accounts
        .iter()
        .find(|a| a.id == id)
        .ok_or_else(|| "Account not found".to_string())?;

    Ok(account_to_otpauth_uri(account))
}

/// Renders a single account's otpauth URI as a QR code PNG and writes it to `path`.
#[tauri::command]
pub fn export_account_qr(
    state: State<'_, Mutex<AppState>>,
    id: String,
    path: String,
) -> Result<bool, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;
    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let account = s
        .accounts
        .iter()
        .find(|a| a.id == id)
        .ok_or_else(|| "Account not found".to_string())?;

    let uri = account_to_otpauth_uri(account);
    // Sanity-check: the URI must round-trip through the parser.
    parse_otpauth_uri(&uri)?;

    let png = export::qr::encode_png(&uri, None)?;
    fs::write(&path, &png)
        .map_err(|e| format!("Failed to write QR file '{}': {}", path, e))?;

    Ok(true)
}

/// Encodes the entire vault as Google Authenticator migration QR(s) and writes
/// each one as a PNG to the given directory. Returns the absolute paths written.
#[tauri::command]
pub fn export_google_qr(
    state: State<'_, Mutex<AppState>>,
    dir: String,
    prefix: String,
) -> Result<Vec<String>, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;
    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }
    if s.accounts.is_empty() {
        return Err("No accounts to export".to_string());
    }

    let dir_path = Path::new(&dir);
    if !dir_path.is_dir() {
        return Err(format!("Not a directory: {}", dir));
    }

    let uris = export::serialize_google_migration(&s.accounts, None)?;
    let mut written = Vec::with_capacity(uris.len());

    for (idx, uri) in uris.iter().enumerate() {
        let filename = if uris.len() == 1 {
            format!("{}.png", prefix)
        } else {
            format!("{}_{:03}.png", prefix, idx + 1)
        };
        let path = dir_path.join(&filename);
        let png = export::qr::encode_png(uri, None)?;
        fs::write(&path, &png)
            .map_err(|e| format!("Failed to write '{}': {}", path.display(), e))?;
        written.push(path.to_string_lossy().to_string());
    }

    Ok(written)
}
