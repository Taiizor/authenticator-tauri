use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::Argon2;
use rand::Rng;
use zeroize::Zeroize;

use crate::models::account::Account;

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

/// Derives a 256-bit key from a password using Argon2id
pub fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; KEY_LEN], String> {
    use argon2::{Algorithm, Params, Version};

    let params = Params::new(65536, 3, 1, Some(KEY_LEN))
        .map_err(|e| format!("Argon2 params error: {}", e))?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

    let mut key = [0u8; KEY_LEN];
    argon2
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("Argon2 hash error: {}", e))?;

    Ok(key)
}

/// Encrypts data using AES-256-GCM
/// Returns: [16-byte salt][12-byte nonce][ciphertext+tag]
pub fn encrypt(data: &[u8], password: &str) -> Result<Vec<u8>, String> {
    let mut salt = [0u8; SALT_LEN];
    rand::rng().fill_bytes(&mut salt);

    let mut key = derive_key(password, &salt)?;

    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Cipher init error: {}", e))?;
    key.zeroize();

    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption error: {}", e))?;

    let mut result = Vec::with_capacity(SALT_LEN + NONCE_LEN + ciphertext.len());
    result.extend_from_slice(&salt);
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);

    Ok(result)
}

/// Decrypts data that was encrypted with `encrypt()`
/// Input format: [16-byte salt][12-byte nonce][ciphertext+tag]
pub fn decrypt(encrypted: &[u8], password: &str) -> Result<Vec<u8>, String> {
    if encrypted.len() < SALT_LEN + NONCE_LEN + 16 {
        return Err("Encrypted data too short".to_string());
    }

    let salt = &encrypted[..SALT_LEN];
    let nonce_bytes = &encrypted[SALT_LEN..SALT_LEN + NONCE_LEN];
    let ciphertext = &encrypted[SALT_LEN + NONCE_LEN..];

    let mut key = derive_key(password, salt)?;
    let nonce = Nonce::from_slice(nonce_bytes);

    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Cipher init error: {}", e))?;
    key.zeroize();

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: wrong password or corrupted data".to_string())
}

/// Reads the 16-byte KDF salt from the start of an encrypted blob.
pub fn extract_salt(encrypted: &[u8]) -> Result<[u8; SALT_LEN], String> {
    if encrypted.len() < SALT_LEN + NONCE_LEN + 16 {
        return Err("Encrypted data too short".to_string());
    }
    let mut salt = [0u8; SALT_LEN];
    salt.copy_from_slice(&encrypted[..SALT_LEN]);
    Ok(salt)
}

/// Encrypts data with an already-derived key, embedding the supplied salt for
/// later decryption.
///
/// Output format: `[16-byte salt][12-byte nonce][ciphertext+tag]` — identical
/// to [`encrypt`], so blobs produced here are interchangeable.
pub fn encrypt_with_key(
    data: &[u8],
    key: &[u8; KEY_LEN],
    salt: &[u8; SALT_LEN],
) -> Result<Vec<u8>, String> {
    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| format!("Cipher init error: {}", e))?;

    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption error: {}", e))?;

    let mut result = Vec::with_capacity(SALT_LEN + NONCE_LEN + ciphertext.len());
    result.extend_from_slice(salt);
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    Ok(result)
}

/// Decrypts data with an already-derived key. The salt embedded in the blob
/// is ignored — the caller must have derived the key beforehand using the same
/// salt.
pub fn decrypt_with_key(encrypted: &[u8], key: &[u8; KEY_LEN]) -> Result<Vec<u8>, String> {
    if encrypted.len() < SALT_LEN + NONCE_LEN + 16 {
        return Err("Encrypted data too short".to_string());
    }

    let nonce_bytes = &encrypted[SALT_LEN..SALT_LEN + NONCE_LEN];
    let ciphertext = &encrypted[SALT_LEN + NONCE_LEN..];
    let nonce = Nonce::from_slice(nonce_bytes);

    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| format!("Cipher init error: {}", e))?;

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: wrong key or corrupted data".to_string())
}

/// Encrypts a list of accounts using a pre-derived key and a fixed salt.
pub fn encrypt_vault_with_key(
    accounts: &[Account],
    key: &[u8; KEY_LEN],
    salt: &[u8; SALT_LEN],
) -> Result<Vec<u8>, String> {
    let json =
        serde_json::to_string(accounts).map_err(|e| format!("Serialization error: {}", e))?;
    encrypt_with_key(json.as_bytes(), key, salt)
}

/// Decrypts a vault blob into accounts using a pre-derived key.
pub fn decrypt_vault_with_key(
    encrypted: &[u8],
    key: &[u8; KEY_LEN],
) -> Result<Vec<Account>, String> {
    let decrypted = decrypt_with_key(encrypted, key)?;
    let json =
        String::from_utf8(decrypted).map_err(|e| format!("UTF-8 decode error: {}", e))?;
    serde_json::from_str(&json).map_err(|e| format!("Deserialization error: {}", e))
}
