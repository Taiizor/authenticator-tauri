# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-16

### Fixed
- Accept OTP secrets shorter than 128 bits (e.g., Coolify 80-bit secrets)

## [1.0.0] - 2026-02-26

### Added
- TOTP and HOTP code generation (RFC 6238, RFC 4226)
- AES-256-GCM encrypted vault with Argon2id key derivation
- Import from Google Authenticator, Aegis, 2FAS, Ente Auth, CSV, QR codes
- Encrypted backup and restore
- Dark, Light, and System theme support
- English and Turkish language support
- System tray with minimize to tray
- Drag and drop account reordering
- Keyboard shortcuts (Ctrl+N, Ctrl+F, Ctrl+L, Ctrl+,)
- Auto-lock after inactivity
- Platform keychain integration
- Cross-platform support: Windows, macOS, Linux
