use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub compact_mode: bool,
    pub show_icons: bool,
    pub auto_lock_timeout: u64,
    pub minimize_to_tray: bool,
    pub start_minimized: bool,
    pub auto_start: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            compact_mode: false,
            show_icons: true,
            auto_lock_timeout: 300,
            minimize_to_tray: true,
            start_minimized: false,
            auto_start: false,
        }
    }
}
