use base64::{engine::general_purpose::STANDARD, Engine};
use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::crypto::vault;
use crate::models::account::Account;

const MAGIC: &str = "AUTHENTICATOR_BACKUP_V1";

#[derive(Debug, Serialize, Deserialize)]
struct BackupHeader {
    version: u32,
    created_at: i64,
    account_count: usize,
}

/// Creates an encrypted backup from a list of accounts.
///
/// The backup format is:
/// ```text
/// AUTHENTICATOR_BACKUP_V1\n
/// {"version":1,"created_at":<timestamp>,"account_count":<n>}\n
/// <base64-encoded encrypted payload>
/// ```
///
/// The payload is the JSON-serialized account list encrypted with AES-256-GCM + Argon2id.
pub fn create_backup(accounts: &[Account], password: &str) -> Result<Vec<u8>, String> {
    // Serialize accounts to JSON
    let accounts_json =
        serde_json::to_string(accounts).map_err(|e| format!("Serialization error: {}", e))?;

    // Encrypt the JSON payload using the vault's encrypt function
    let encrypted =
        vault::encrypt(accounts_json.as_bytes(), password)?;

    // Base64-encode the encrypted payload
    let encoded = STANDARD.encode(&encrypted);

    // Build the header
    let header = BackupHeader {
        version: 1,
        created_at: Utc::now().timestamp(),
        account_count: accounts.len(),
    };
    let header_json =
        serde_json::to_string(&header).map_err(|e| format!("Header serialization error: {}", e))?;

    // Assemble the backup: magic\nheader\npayload
    let backup = format!("{}\n{}\n{}", MAGIC, header_json, encoded);

    Ok(backup.into_bytes())
}

/// Restores accounts from an encrypted backup.
///
/// Parses the 3-line backup format, validates the magic string,
/// base64-decodes the payload, decrypts it, and deserializes the accounts.
pub fn restore_backup(data: &[u8], password: &str) -> Result<Vec<Account>, String> {
    // Convert raw bytes to a UTF-8 string
    let text = String::from_utf8(data.to_vec())
        .map_err(|_| "Backup data is not valid UTF-8".to_string())?;

    // Split into exactly 3 lines
    let lines: Vec<&str> = text.splitn(3, '\n').collect();
    if lines.len() < 3 {
        return Err("Invalid backup format: expected 3 lines".to_string());
    }

    // Validate magic string
    if lines[0] != MAGIC {
        return Err(format!(
            "Invalid backup format: unrecognized magic string '{}'",
            lines[0]
        ));
    }

    // Parse and validate header
    let _header: BackupHeader = serde_json::from_str(lines[1])
        .map_err(|e| format!("Invalid backup header: {}", e))?;

    // Base64-decode the encrypted payload
    let encrypted = STANDARD
        .decode(lines[2])
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    // Decrypt using the vault's decrypt function
    let decrypted = vault::decrypt(&encrypted, password)?;

    // Deserialize JSON back into accounts
    let json =
        String::from_utf8(decrypted).map_err(|e| format!("UTF-8 decode error: {}", e))?;
    let accounts: Vec<Account> =
        serde_json::from_str(&json).map_err(|e| format!("Deserialization error: {}", e))?;

    Ok(accounts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::account::{Algorithm, OtpType};

    fn make_test_accounts() -> Vec<Account> {
        vec![
            Account {
                id: "test-id-1".to_string(),
                name: "Test Account".to_string(),
                issuer: Some("TestIssuer".to_string()),
                secret: "JBSWY3DPEHPK3PXP".to_string(),
                otp_type: OtpType::Totp,
                digits: 6,
                period: 30,
                algorithm: Algorithm::SHA1,
                counter: None,
                category: None,
                icon: None,
                color: None,
                sort_order: 0,
                created_at: 1700000000,
            },
            Account {
                id: "test-id-2".to_string(),
                name: "Another Account".to_string(),
                issuer: None,
                secret: "NBSWY3DPEHPK3PXP".to_string(),
                otp_type: OtpType::Hotp,
                digits: 8,
                period: 30,
                algorithm: Algorithm::SHA256,
                counter: Some(42),
                category: Some("Work".to_string()),
                icon: Some("briefcase".to_string()),
                color: Some("#ff0000".to_string()),
                sort_order: 1,
                created_at: 1700000001,
            },
        ]
    }

    #[test]
    fn test_create_and_restore_backup() {
        let accounts = make_test_accounts();
        let password = "strong-test-password";

        let backup = create_backup(&accounts, password).expect("create_backup should succeed");

        let restored =
            restore_backup(&backup, password).expect("restore_backup should succeed");

        assert_eq!(restored.len(), accounts.len());
        assert_eq!(restored[0].id, accounts[0].id);
        assert_eq!(restored[0].name, accounts[0].name);
        assert_eq!(restored[0].secret, accounts[0].secret);
        assert_eq!(restored[1].id, accounts[1].id);
        assert_eq!(restored[1].counter, accounts[1].counter);
    }

    #[test]
    fn test_backup_format_structure() {
        let accounts = make_test_accounts();
        let password = "test-password";

        let backup = create_backup(&accounts, password).expect("create_backup should succeed");
        let text = String::from_utf8(backup).expect("backup should be valid UTF-8");

        let lines: Vec<&str> = text.splitn(3, '\n').collect();
        assert_eq!(lines.len(), 3);
        assert_eq!(lines[0], MAGIC);

        let header: BackupHeader =
            serde_json::from_str(lines[1]).expect("header should be valid JSON");
        assert_eq!(header.version, 1);
        assert_eq!(header.account_count, 2);
        assert!(header.created_at > 0);

        // Payload should be valid base64
        STANDARD
            .decode(lines[2])
            .expect("payload should be valid base64");
    }

    #[test]
    fn test_wrong_password_fails() {
        let accounts = make_test_accounts();
        let backup =
            create_backup(&accounts, "correct-password").expect("create_backup should succeed");

        let result = restore_backup(&backup, "wrong-password");
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_magic_fails() {
        let data = b"INVALID_MAGIC\n{\"version\":1}\nbase64data";
        let result = restore_backup(data, "password");
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("unrecognized magic string"));
    }

    #[test]
    fn test_too_few_lines_fails() {
        let data = b"AUTHENTICATOR_BACKUP_V1\nonly_two_lines";
        let result = restore_backup(data, "password");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("expected 3 lines"));
    }

    #[test]
    fn test_empty_accounts() {
        let accounts: Vec<Account> = vec![];
        let password = "test-password";

        let backup = create_backup(&accounts, password).expect("create_backup should succeed");
        let restored =
            restore_backup(&backup, password).expect("restore_backup should succeed");

        assert_eq!(restored.len(), 0);
    }
}
