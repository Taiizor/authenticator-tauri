import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/tauri";
import type { Settings } from "@/types";

const defaultSettings: Settings = {
  theme: "system",
  language: "en",
  auto_lock_minutes: 5,
  minimize_to_tray: true,
  start_minimized: false,
  remember_password: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings().finally(() => setLoading(false));
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: Settings) => {
    try {
      const saved = await api.updateSettings(newSettings);
      setSettings(saved);
      return saved;
    } catch (err) {
      console.error("Failed to update settings:", err);
      throw err;
    }
  }, []);

  return { settings, loading, updateSettings, refresh: fetchSettings };
}
