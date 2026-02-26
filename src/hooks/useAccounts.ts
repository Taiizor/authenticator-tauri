import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/tauri";
import type { AccountView } from "@/types";

export function useAccounts(isUnlocked: boolean) {
  const [accounts, setAccounts] = useState<AccountView[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!isUnlocked) return;
    try {
      const [accts, cats] = await Promise.all([
        api.getAccounts(),
        api.getCategories(),
      ]);
      setAccounts(accts.sort((a, b) => a.sort_order - b.sort_order));
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) {
      setAccounts([]);
      setCategories([]);
      return;
    }
    setLoading(true);
    fetchAccounts().finally(() => setLoading(false));
  }, [isUnlocked, fetchAccounts]);

  return { accounts, categories, loading, refresh: fetchAccounts };
}
