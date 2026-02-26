<p align="center">
  <h1 align="center">&#x1f6e1;&#xfe0f; Authenticator</h1>
</p>

<p align="center">
  A modern, cross-platform, open-source two-factor authentication app built with Tauri v2 and React.
</p>

<p align="center">
  <a href="https://github.com/Taiizor/authenticator-tauri/actions"><img src="https://img.shields.io/github/actions/workflow/status/user/authenticator/build.yml?branch=main&style=flat-square" alt="Build Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square" alt="Platform"></a>
</p>

---

<!-- screenshot will be added -->

## About

Authenticator is a desktop two-factor authentication (2FA) application that keeps your accounts secure. All secret keys are encrypted at rest with AES-256-GCM and never leave the Rust backend process. Built on Tauri v2, it delivers a native, lightweight experience on Windows, macOS, and Linux.

## Features

- **TOTP & HOTP support** -- Full compliance with RFC 6238 (TOTP) and RFC 4226 (HOTP), supporting SHA-1, SHA-256, and SHA-512 algorithms
- **AES-256-GCM encrypted vault** -- Master password protected with Argon2id key derivation (64 MB memory, 3 iterations)
- **Secrets never leave Rust** -- Secret keys are held exclusively in the Rust process; only generated codes are sent to the frontend
- **Rich import support** -- Import from Google Authenticator, Aegis, 2FAS, Ente Auth, CSV files, QR code images, and `otpauth://` URIs
- **Encrypted backup & restore** -- Export and import password-protected backups to keep your vault safe across devices
- **Dark / Light / System theme** -- Seamlessly follows your OS appearance preference or lets you choose manually
- **English & Turkish languages** -- Localized interface with i18next; contributions for additional languages welcome
- **System tray integration** -- Minimize to tray, restore on double-click, lock and quit from the tray menu
- **Drag & drop reordering** -- Organize accounts in any order you like with intuitive drag and drop
- **Keyboard shortcuts** -- Navigate and manage accounts without leaving the keyboard
- **Auto-lock after inactivity** -- Configurable timeout that automatically locks the vault when you step away
- **Platform keychain integration** -- Optionally store the vault key in the OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- **Cross-platform** -- Runs natively on Windows, macOS, and Linux with a single codebase

## Installation

### Download

Download the latest installer for your platform from the [Releases](https://github.com/Taiizor/authenticator-tauri/releases) page.

| Platform | File |
|----------|------|
| Windows  | `.msi` / `.exe` |
| macOS    | `.dmg` |
| Linux    | `.deb` / `.AppImage` |

### Build from Source

#### Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| [Bun](https://bun.sh/) | 1.0+ |
| [Rust](https://www.rust-lang.org/tools/install) | 1.70+ |
| [protoc](https://grpc.io/docs/protoc-installation/) | 3.x |

#### Steps

```bash
# Clone the repository
git clone https://github.com/Taiizor/authenticator-tauri.git
cd authenticator-tauri

# Install frontend dependencies
bun install

# Build the application
bun run tauri build
```

The compiled binary and installer will be located in `src-tauri/target/release/bundle/`.

## Development

Start the app in development mode with hot-reload:

```bash
bun run tauri dev
```

This launches the Vite dev server for the React frontend and the Tauri Rust backend simultaneously.

## Security

Authenticator is designed with a security-first architecture:

| Layer | Detail |
|-------|--------|
| **Encryption** | AES-256-GCM authenticated encryption |
| **Key Derivation** | Argon2id with 64 MB memory cost, 3 iterations, 1 lane |
| **Vault Format** | `[16-byte salt][12-byte nonce][ciphertext + auth tag]` |
| **Secret Isolation** | Secret keys are decrypted and used only inside the Rust process. The frontend never receives raw secrets -- only time-limited OTP codes. |
| **Keychain** | Optional OS keychain integration for remembering the vault key (Windows Credential Manager, macOS Keychain, Linux Secret Service via `keyring` crate) |
| **Auto-Lock** | Configurable inactivity timer that clears secrets from memory and locks the vault |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl/Cmd</kbd> + <kbd>N</kbd> | Add new account |
| <kbd>Ctrl/Cmd</kbd> + <kbd>F</kbd> | Focus search bar |
| <kbd>Ctrl/Cmd</kbd> + <kbd>L</kbd> | Lock vault |
| <kbd>Ctrl/Cmd</kbd> + <kbd>,</kbd> | Open settings |
| <kbd>Escape</kbd> | Close dialog / clear search |

## Import Formats

| Source | Format | Notes |
|--------|--------|-------|
| Google Authenticator | Protobuf (migration QR) | Scan the export QR as an image |
| Aegis | JSON (plain / encrypted) | Aegis vault export |
| 2FAS | JSON | 2FAS Authenticator backup |
| Ente Auth | Plain-text export | Ente Auth text export |
| CSV | `.csv` | Columns: `name`, `secret`, `issuer`, `type`, `digits`, `period`, `algorithm` |
| QR Code Image | `.png` / `.jpg` | Any image containing an `otpauth://` QR code |
| URI | `otpauth://totp/...` or `otpauth://hotp/...` | Manual URI entry |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Tauri v2](https://v2.tauri.app/) |
| Backend | [Rust](https://www.rust-lang.org/) |
| Frontend | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| OTP | [`totp-rs`](https://crates.io/crates/totp-rs) |
| Encryption | [`aes-gcm`](https://crates.io/crates/aes-gcm) + [`argon2`](https://crates.io/crates/argon2) |
| Keychain | [`keyring`](https://crates.io/crates/keyring) |
| Drag & Drop | [`@dnd-kit`](https://dndkit.com/) |
| i18n | [`i18next`](https://www.i18next.com/) + [`react-i18next`](https://react.i18next.com/) |
| Runtime & Build | [Bun](https://bun.sh/) + [Vite](https://vite.dev/) |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
