use std::sync::Mutex;

use tauri::{AppHandle, State};
use zeroize::Zeroize;

use crate::crypto::keychain;
use crate::state::AppState;
use crate::storage::vault;

#[tauri::command]
pub fn is_vault_setup(app: AppHandle) -> bool {
    vault::vault_exists(&app)
}

#[tauri::command]
pub fn setup_vault(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    password: String,
) -> Result<(), String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    // Create a new empty vault with the given password
    vault::save_vault(&app, &[], &password)?;

    s.accounts = Vec::new();
    s.password = Some(password);
    s.unlocked = true;

    Ok(())
}

#[tauri::command]
pub fn unlock_vault(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    password: String,
) -> Result<bool, String> {
    let loaded = match vault::load_vault(&app, &password) {
        Ok(accounts) => accounts,
        Err(_) => {
            // Decryption failed — wrong password
            return Ok(false);
        }
    };

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts = loaded;
    s.password = Some(password.clone());
    s.unlocked = true;
    drop(s);

    // Store password in keychain if remember_password is enabled
    if let Ok(settings) = vault::load_settings(&app) {
        if settings.remember_password {
            let _ = keychain::store_password(&password);
        }
    }

    Ok(true)
}

#[tauri::command]
pub fn lock_vault(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    // Zeroize sensitive data before dropping
    for account in &mut s.accounts {
        account.secret.zeroize();
    }
    if let Some(ref mut pwd) = s.password {
        pwd.zeroize();
    }

    s.accounts.clear();
    s.password = None;
    s.unlocked = false;

    Ok(())
}

#[tauri::command]
pub fn try_stored_password(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<bool, String> {
    // Check if remember_password is enabled
    let settings = vault::load_settings(&app).unwrap_or_default();
    if !settings.remember_password {
        return Ok(false);
    }

    // Try to retrieve password from keychain
    let password = match keychain::retrieve_password() {
        Ok(Some(p)) => p,
        _ => return Ok(false),
    };

    // Try to unlock with the stored password
    let loaded = match vault::load_vault(&app, &password) {
        Ok(accounts) => accounts,
        Err(_) => {
            // Stored password is stale, clear it
            let _ = keychain::clear_password();
            return Ok(false);
        }
    };

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts = loaded;
    s.password = Some(password);
    s.unlocked = true;

    Ok(true)
}

#[tauri::command]
pub fn change_password(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    old_password: String,
    new_password: String,
) -> Result<bool, String> {
    // Verify old password by attempting to decrypt
    match vault::load_vault(&app, &old_password) {
        Ok(_) => {} // password verified
        Err(_) => return Ok(false),
    };

    // Lock state and re-encrypt in-memory accounts with new password
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    vault::save_vault(&app, &s.accounts, &new_password)?;
    s.password = Some(new_password.clone());
    drop(s);

    // Update keychain if remember_password is enabled
    if let Ok(settings) = vault::load_settings(&app) {
        if settings.remember_password {
            let _ = keychain::store_password(&new_password);
        } else {
            let _ = keychain::clear_password();
        }
    }

    Ok(true)
}
