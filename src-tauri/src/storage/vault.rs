use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::crypto::vault::{decrypt_vault, encrypt_vault};
use crate::models::account::Account;
use crate::models::settings::AppSettings;

/// Returns the path to the encrypted vault file: `{app_data_dir}/vault.enc`
pub fn vault_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to resolve app data directory")
        .join("vault.enc")
}

/// Returns the path to the settings file: `{app_data_dir}/settings.json`
pub fn settings_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to resolve app data directory")
        .join("settings.json")
}

/// Checks whether the encrypted vault file exists on disk.
pub fn vault_exists(app: &AppHandle) -> bool {
    vault_path(app).exists()
}

/// Encrypts and saves the list of accounts to the vault file.
///
/// Creates parent directories if they do not exist.
pub fn save_vault(
    app: &AppHandle,
    accounts: &[Account],
    password: &str,
) -> Result<(), String> {
    let path = vault_path(app);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create vault directory: {}", e))?;
    }

    let encrypted =
        encrypt_vault(accounts, password)?;

    fs::write(&path, &encrypted)
        .map_err(|e| format!("Failed to write vault file: {}", e))?;

    Ok(())
}

/// Loads and decrypts the vault file, returning the list of accounts.
///
/// Returns an error if the file does not exist or decryption fails.
pub fn load_vault(
    app: &AppHandle,
    password: &str,
) -> Result<Vec<Account>, String> {
    let path = vault_path(app);

    let encrypted = fs::read(&path)
        .map_err(|e| format!("Failed to read vault file: {}", e))?;

    decrypt_vault(&encrypted, password)
}

/// Saves application settings as pretty-printed JSON.
///
/// Creates parent directories if they do not exist.
pub fn save_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    let path = settings_path(app);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }

    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;

    Ok(())
}

/// Loads application settings from the JSON file.
///
/// Returns `AppSettings::default()` if the file does not exist.
pub fn load_settings(app: &AppHandle) -> Result<AppSettings, String> {
    let path = settings_path(app);

    if !path.exists() {
        return Ok(AppSettings::default());
    }

    let json = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    serde_json::from_str(&json)
        .map_err(|e| format!("Failed to deserialize settings: {}", e))
}
