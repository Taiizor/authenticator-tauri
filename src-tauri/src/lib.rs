use std::sync::Mutex;

mod commands;
mod crypto;
mod import;
mod models;
mod otp;
mod state;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(state::AppState::default()))
        .invoke_handler(tauri::generate_handler![
            commands::auth::is_vault_setup,
            commands::auth::setup_vault,
            commands::auth::unlock_vault,
            commands::auth::lock_vault,
            commands::auth::change_password,
            commands::accounts::get_accounts,
            commands::accounts::add_account,
            commands::accounts::update_account,
            commands::accounts::delete_account,
            commands::accounts::reorder_accounts,
            commands::accounts::validate_secret,
            commands::codes::get_all_codes,
            commands::codes::increment_hotp,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_categories,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
