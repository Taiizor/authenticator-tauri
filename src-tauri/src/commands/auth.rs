use std::sync::Mutex;

use rand::Rng;
use tauri::{AppHandle, State};
use zeroize::{Zeroize, Zeroizing};

use crate::crypto::keychain;
use crate::crypto::vault::{
    decrypt_vault_with_key, derive_key, encrypt_vault_with_key, extract_salt,
};
use crate::state::AppState;
use crate::storage::vault;

const SALT_LEN: usize = 16;

#[tauri::command]
pub fn is_vault_setup(app: AppHandle) -> bool {
    vault::vault_exists(&app)
}

#[tauri::command]
pub async fn setup_vault(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    password: String,
) -> Result<(), String> {
    let password = Zeroizing::new(password);

    // Generate a fresh salt and derive the vault key once.
    let mut salt = [0u8; SALT_LEN];
    rand::rng().fill_bytes(&mut salt);
    let key = derive_key(&password, &salt)?;

    // Persist an empty vault encrypted with the new key.
    let blob = encrypt_vault_with_key(&[], &key, &salt)?;
    vault::save_vault_blob(&app, &blob)?;

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts = Vec::new();
    s.vault_key = Some(key);
    s.vault_salt = Some(salt);
    s.unlocked = true;

    Ok(())
}

#[tauri::command]
pub async fn unlock_vault(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    password: String,
) -> Result<bool, String> {
    let password = Zeroizing::new(password);

    let blob = match vault::read_vault_blob(&app) {
        Ok(b) => b,
        Err(_) => return Ok(false),
    };

    let salt = match extract_salt(&blob) {
        Ok(s) => s,
        Err(_) => return Ok(false),
    };
    let key = derive_key(&password, &salt)?;

    let loaded = match decrypt_vault_with_key(&blob, &key) {
        Ok(accounts) => accounts,
        Err(_) => {
            // Wrong password — zero out the bogus key and bail.
            let mut k = key;
            k.zeroize();
            return Ok(false);
        }
    };

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts = loaded;
    s.vault_key = Some(key);
    s.vault_salt = Some(salt);
    s.unlocked = true;
    drop(s);

    // Store password in keychain if remember_password is enabled.
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

    // Zeroize sensitive in-memory material before dropping it.
    for account in &mut s.accounts {
        account.secret.zeroize();
    }
    if let Some(ref mut key) = s.vault_key {
        key.zeroize();
    }
    if let Some(ref mut salt) = s.vault_salt {
        salt.zeroize();
    }

    s.accounts.clear();
    s.vault_key = None;
    s.vault_salt = None;
    s.unlocked = false;

    Ok(())
}

#[tauri::command]
pub async fn try_stored_password(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<bool, String> {
    let settings = vault::load_settings(&app).unwrap_or_default();
    if !settings.remember_password {
        return Ok(false);
    }

    let password = match keychain::retrieve_password() {
        Ok(Some(p)) => Zeroizing::new(p),
        _ => return Ok(false),
    };

    let blob = match vault::read_vault_blob(&app) {
        Ok(b) => b,
        Err(_) => return Ok(false),
    };

    let salt = match extract_salt(&blob) {
        Ok(s) => s,
        Err(_) => return Ok(false),
    };
    let key = derive_key(&password, &salt)?;

    let loaded = match decrypt_vault_with_key(&blob, &key) {
        Ok(accounts) => accounts,
        Err(_) => {
            // Stored password is stale — drop key and clear keychain entry.
            let mut k = key;
            k.zeroize();
            let _ = keychain::clear_password();
            return Ok(false);
        }
    };

    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;
    s.accounts = loaded;
    s.vault_key = Some(key);
    s.vault_salt = Some(salt);
    s.unlocked = true;

    Ok(true)
}

#[tauri::command]
pub async fn change_password(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    old_password: String,
    new_password: String,
) -> Result<bool, String> {
    let old_password = Zeroizing::new(old_password);
    let new_password = Zeroizing::new(new_password);

    // Verify the old password against the on-disk blob.
    let blob = vault::read_vault_blob(&app)?;
    let old_salt = extract_salt(&blob)?;
    let old_key = derive_key(&old_password, &old_salt)?;
    if decrypt_vault_with_key(&blob, &old_key).is_err() {
        let mut k = old_key;
        k.zeroize();
        return Ok(false);
    }
    let mut old_key_zeroize = old_key;
    old_key_zeroize.zeroize();

    // Lock state, derive a fresh key under a new salt, re-encrypt, swap state.
    let mut s = state.lock().map_err(|_| "State lock failed".to_string())?;

    let mut new_salt = [0u8; SALT_LEN];
    rand::rng().fill_bytes(&mut new_salt);
    let new_key = derive_key(&new_password, &new_salt)?;

    let new_blob = encrypt_vault_with_key(&s.accounts, &new_key, &new_salt)?;
    vault::save_vault_blob(&app, &new_blob)?;

    if let Some(ref mut k) = s.vault_key {
        k.zeroize();
    }
    if let Some(ref mut salt) = s.vault_salt {
        salt.zeroize();
    }
    s.vault_key = Some(new_key);
    s.vault_salt = Some(new_salt);
    drop(s);

    // Keep the keychain entry in sync with the user's preference.
    if let Ok(settings) = vault::load_settings(&app) {
        if settings.remember_password {
            let _ = keychain::store_password(&new_password);
        } else {
            let _ = keychain::clear_password();
        }
    }

    Ok(true)
}
