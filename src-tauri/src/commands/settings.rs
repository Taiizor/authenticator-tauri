use std::sync::Mutex;

use tauri::{AppHandle, State};

use crate::models::settings::AppSettings;
use crate::state::AppState;
use crate::storage::vault;

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    vault::load_settings(&app)
}

#[tauri::command]
pub fn update_settings(app: AppHandle, settings: AppSettings) -> Result<AppSettings, String> {
    vault::save_settings(&app, &settings)?;
    Ok(settings)
}

#[tauri::command]
pub fn get_categories(state: State<'_, Mutex<AppState>>) -> Result<Vec<String>, String> {
    let s = state.lock().map_err(|_| "State lock failed".to_string())?;

    if !s.unlocked {
        return Err("Vault is locked".to_string());
    }

    let mut categories: Vec<String> = s
        .accounts
        .iter()
        .filter_map(|a| a.category.clone())
        .collect();

    categories.sort();
    categories.dedup();

    Ok(categories)
}
