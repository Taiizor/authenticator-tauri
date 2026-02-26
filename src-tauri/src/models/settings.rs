use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    #[serde(default = "default_theme")]
    pub theme: Theme,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default = "default_auto_lock")]
    pub auto_lock_minutes: u32,
    #[serde(default)]
    pub minimize_to_tray: bool,
    #[serde(default)]
    pub start_minimized: bool,
    #[serde(default)]
    pub remember_password: bool,
}

fn default_theme() -> Theme {
    Theme::System
}

fn default_language() -> String {
    "en".to_string()
}

fn default_auto_lock() -> u32 {
    5
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: default_theme(),
            language: default_language(),
            auto_lock_minutes: default_auto_lock(),
            minimize_to_tray: true,
            start_minimized: false,
            remember_password: false,
        }
    }
}
