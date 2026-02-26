import { invoke } from "@tauri-apps/api/core";
import type { AccountView, CodeResponse, Settings } from "@/types";

export const api = {
  // Auth
  isVaultSetup: () => invoke<boolean>("is_vault_setup"),
  setupVault: (password: string) => invoke<void>("setup_vault", { password }),
  unlockVault: (password: string) =>
    invoke<boolean>("unlock_vault", { password }),
  lockVault: () => invoke<void>("lock_vault"),
  tryStoredPassword: () => invoke<boolean>("try_stored_password"),
  changePassword: (oldPassword: string, newPassword: string) =>
    invoke<boolean>("change_password", {
      oldPassword,
      newPassword,
    }),

  // Accounts
  getAccounts: () => invoke<AccountView[]>("get_accounts"),
  addAccount: (params: {
    name: string;
    secret: string;
    otpType: "totp" | "hotp";
    digits: number;
    period: number;
    algorithm: "SHA1" | "SHA256" | "SHA512";
    issuer?: string;
    category?: string;
    icon?: string;
    color?: string;
  }) => invoke<AccountView>("add_account", params),
  updateAccount: (params: {
    id: string;
    name?: string;
    issuer?: string;
    secret?: string;
    category?: string;
    icon?: string;
    color?: string;
  }) => invoke<AccountView>("update_account", params),
  deleteAccount: (id: string) => invoke<boolean>("delete_account", { id }),
  reorderAccounts: (ids: string[]) =>
    invoke<boolean>("reorder_accounts", { ids }),
  validateSecret: (secret: string) =>
    invoke<boolean>("validate_secret", { secret }),

  // Codes
  getAllCodes: () => invoke<CodeResponse[]>("get_all_codes"),
  incrementHotp: (id: string) =>
    invoke<CodeResponse>("increment_hotp", { id }),

  // Settings
  getSettings: () => invoke<Settings>("get_settings"),
  updateSettings: (settings: Settings) =>
    invoke<Settings>("update_settings", { settings }),

  // Categories
  getCategories: () => invoke<string[]>("get_categories"),

  // Import/Export
  importFromUri: (uri: string) =>
    invoke<AccountView>("import_from_uri", { uri }),
  importFromQrImage: (path: string) =>
    invoke<AccountView[]>("import_from_qr_image", { path }),
  importFromFile: (path: string, format: string) =>
    invoke<AccountView[]>("import_from_file", { path, format }),
  exportBackup: (path: string, password: string) =>
    invoke<boolean>("export_backup", { path, password }),
  importBackup: (path: string, password: string) =>
    invoke<AccountView[]>("import_backup", { path, password }),
  exportPlain: (path: string, password: string) =>
    invoke<boolean>("export_plain", { path, password }),
};
