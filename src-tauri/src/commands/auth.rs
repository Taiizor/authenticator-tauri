use std::sync::Mutex;

use tauri::{AppHandle, State};

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
    s.password = Some(password);
    s.unlocked = true;

    Ok(true)
}

#[tauri::command]
pub fn lock_vault(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts.clear();
    s.password = None;
    s.unlocked = false;

    Ok(())
}

#[tauri::command]
pub fn change_password(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    old_password: String,
    new_password: String,
) -> Result<bool, String> {
    // Verify old password by attempting to decrypt
    let accounts = match vault::load_vault(&app, &old_password) {
        Ok(accounts) => accounts,
        Err(_) => {
            // Old password is wrong
            return Ok(false);
        }
    };

    // Re-encrypt with new password
    vault::save_vault(&app, &accounts, &new_password)?;

    // Update state with new password
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.password = Some(new_password);

    Ok(true)
}
