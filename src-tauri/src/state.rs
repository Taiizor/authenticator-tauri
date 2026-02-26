use std::sync::Mutex;
use crate::models::account::Account;

pub struct AppState {
    pub accounts: Vec<Account>,
    pub password: Option<String>,
    pub unlocked: bool,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            accounts: Vec::new(),
            password: None,
            unlocked: false,
        }
    }
}

pub type AppStateMutex = Mutex<AppState>;
