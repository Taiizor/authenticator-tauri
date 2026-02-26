use std::sync::Mutex;

use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    Emitter, Manager,
};

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
            commands::import_export::import_from_uri,
            commands::import_export::import_from_qr_image,
            commands::import_export::import_from_file,
            commands::import_export::export_backup,
            commands::import_export::import_backup,
            commands::import_export::export_plain,
        ])
        .setup(|app| {
            // Create menu items
            let open = MenuItemBuilder::with_id("open", "Open").build(app)?;
            let lock = MenuItemBuilder::with_id("lock", "Lock").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

            // Build the tray menu
            let menu = MenuBuilder::new(app)
                .item(&open)
                .item(&lock)
                .separator()
                .item(&quit)
                .build()?;

            // Build the tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().unwrap())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| {
                    match event.id().as_ref() {
                        "open" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "lock" => {
                            let state = app.state::<Mutex<state::AppState>>();
                            if let Ok(mut s) = state.lock() {
                                s.accounts.clear();
                                s.password = None;
                                s.unlocked = false;
                            }
                            // Emit event to frontend so UI reflects the locked state
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("vault-locked", ());
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::DoubleClick { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let settings = storage::vault::load_settings(app);
                if let Ok(settings) = settings {
                    if settings.minimize_to_tray {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
