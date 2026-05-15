use image::{GrayImage, ImageFormat, Luma};
use qrcode::QrCode;
use std::io::Cursor;

const QUIET_ZONE: u32 = 4;
const DEFAULT_SCALE: u32 = 8;

/// Encodes the given payload as a QR code and returns the rendered PNG bytes.
///
/// The output uses a fixed quiet zone of 4 modules and a configurable per-module
/// pixel scale. PNG is grayscale (1 channel).
pub fn encode_png(payload: &str, scale: Option<u32>) -> Result<Vec<u8>, String> {
    let scale = scale.unwrap_or(DEFAULT_SCALE).max(1);

    let code = QrCode::new(payload.as_bytes())
        .map_err(|e| format!("QR encode error: {}", e))?;
    let modules = code.to_colors();
    let size = code.width() as u32;
    let canvas = (size + 2 * QUIET_ZONE) * scale;

    let mut img = GrayImage::from_pixel(canvas, canvas, Luma([255]));

    for y in 0..size {
        for x in 0..size {
            if modules[(y * size + x) as usize] == qrcode::Color::Dark {
                let px = (x + QUIET_ZONE) * scale;
                let py = (y + QUIET_ZONE) * scale;
                for dy in 0..scale {
                    for dx in 0..scale {
                        img.put_pixel(px + dx, py + dy, Luma([0]));
                    }
                }
            }
        }
    }

    let mut buf = Vec::new();
    img.write_to(&mut Cursor::new(&mut buf), ImageFormat::Png)
        .map_err(|e| format!("PNG encode error: {}", e))?;
    Ok(buf)
}
