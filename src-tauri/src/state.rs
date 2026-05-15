use tauri::AppHandle;

use crate::crypto::vault::encrypt_vault_with_key;
use crate::models::account::Account;
use crate::storage::vault::save_vault_blob;

pub struct AppState {
    pub accounts: Vec<Account>,
    /// 32-byte AES-256 key derived once at unlock time. Held in memory until
    /// the vault is locked, so per-write encryption can skip Argon2id.
    pub vault_key: Option<[u8; 32]>,
    /// 16-byte salt that was used to derive `vault_key`. Required to keep the
    /// blob format identical across writes (and to re-derive after a lock).
    pub vault_salt: Option<[u8; 16]>,
    pub unlocked: bool,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            accounts: Vec::new(),
            vault_key: None,
            vault_salt: None,
            unlocked: false,
        }
    }
}

impl AppState {
    /// Encrypts the in-memory accounts with the cached key+salt and persists
    /// them. Returns an error if the vault is locked.
    ///
    /// This skips Argon2id entirely — the KDF only runs at unlock/setup/
    /// change_password time, so per-write cost is dominated by AES-GCM.
    pub fn persist(&self, app: &AppHandle) -> Result<(), String> {
        let key = self
            .vault_key
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        let salt = self
            .vault_salt
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        let blob = encrypt_vault_with_key(&self.accounts, key, salt)?;
        save_vault_blob(app, &blob)
    }
}
