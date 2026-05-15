use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

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

/// Atomically writes a raw vault blob (already encrypted) to disk.
///
/// Creates parent directories if they do not exist and writes via a temp file
/// + rename so a partial write cannot corrupt the existing vault.
pub fn save_vault_blob(app: &AppHandle, blob: &[u8]) -> Result<(), String> {
    let path = vault_path(app);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create vault directory: {}", e))?;
    }

    let temp_path = path.with_extension("tmp");
    fs::write(&temp_path, blob)
        .map_err(|e| format!("Failed to write vault file: {}", e))?;
    fs::rename(&temp_path, &path)
        .map_err(|e| format!("Failed to finalize vault file: {}", e))?;

    Ok(())
}

/// Reads the raw encrypted vault blob from disk.
pub fn read_vault_blob(app: &AppHandle) -> Result<Vec<u8>, String> {
    let path = vault_path(app);
    fs::read(&path).map_err(|e| format!("Failed to read vault file: {}", e))
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

    let temp_path = path.with_extension("tmp");
    fs::write(&temp_path, &json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    fs::rename(&temp_path, &path)
        .map_err(|e| format!("Failed to finalize settings file: {}", e))?;

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
