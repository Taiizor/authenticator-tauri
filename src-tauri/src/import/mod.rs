pub mod aegis;
pub mod csv_import;
pub mod ente;
pub mod google;
pub mod twofas;
pub mod uri;

pub use aegis::parse_aegis;
pub use csv_import::parse_csv;
pub use ente::parse_ente;
pub use google::parse_google_auth;
pub use twofas::parse_twofas;
pub use uri::parse_uri;

/// Reads and decodes a QR code from an image file.
///
/// Supports PNG and JPEG image formats.
/// Returns the decoded string content of the QR code.
pub fn read_qr_image(path: &str) -> Result<String, String> {
    // Load the image from file
    let img = image::open(path).map_err(|e| format!("Failed to open image '{}': {}", path, e))?;

    // Convert to grayscale (luma8)
    let luma = img.to_luma8();

    // Prepare image for QR detection
    let mut prepared = rqrr::PreparedImage::prepare(luma);

    // Detect QR code grids
    let grids = prepared.detect_grids();

    if grids.is_empty() {
        return Err("No QR code found in image".to_string());
    }

    // Decode the first detected QR code
    let (_meta, content) = grids[0]
        .decode()
        .map_err(|e| format!("Failed to decode QR code: {}", e))?;

    Ok(content)
}
