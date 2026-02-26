import { invoke } from "@tauri-apps/api/core";

// Placeholder - will be implemented in Task 16
export const api = {
  isVaultSetup: () => invoke<boolean>("is_vault_setup"),
};
