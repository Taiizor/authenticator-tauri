use keyring::Entry;

const SERVICE_NAME: &str = "authenticator";
const USERNAME: &str = "master-key";

/// Store password in platform keychain
pub fn store_password(password: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;
    entry
        .set_password(password)
        .map_err(|e| format!("Failed to store password: {}", e))?;
    Ok(())
}

/// Retrieve password from platform keychain, returns None if not found
pub fn retrieve_password() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve password: {}", e)),
    }
}

/// Remove password from platform keychain
pub fn clear_password() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // Already cleared
        Err(e) => Err(format!("Failed to clear password: {}", e)),
    }
}
