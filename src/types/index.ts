export interface AccountView {
  id: string;
  name: string;
  issuer?: string;
  otp_type: "totp" | "hotp";
  digits: number;
  period: number;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  category?: string;
  icon?: string;
  color?: string;
  sort_order: number;
}

export interface CodeResponse {
  id: string;
  code: string;
  remaining: number;
  period: number;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  language: string;
  auto_lock_minutes: number;
  minimize_to_tray: boolean;
  start_minimized: boolean;
  remember_password: boolean;
}
