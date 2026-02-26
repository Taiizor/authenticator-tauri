import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/tauri";
import type { CodeResponse } from "@/types";

export function useCodes(isUnlocked: boolean) {
  const [codes, setCodes] = useState<CodeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCodes = useCallback(async () => {
    if (!isUnlocked) return;
    try {
      const result = await api.getAllCodes();
      setCodes(result);
    } catch (err) {
      console.error("Failed to fetch codes:", err);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) {
      setCodes([]);
      return;
    }

    setLoading(true);
    fetchCodes().finally(() => setLoading(false));

    // Poll every second to update remaining time
    intervalRef.current = setInterval(fetchCodes, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isUnlocked, fetchCodes]);

  const getCode = useCallback(
    (accountId: string): CodeResponse | undefined => {
      return codes.find((c) => c.id === accountId);
    },
    [codes]
  );

  const incrementHotp = useCallback(
    async (id: string): Promise<CodeResponse | undefined> => {
      try {
        const code = await api.incrementHotp(id);
        // Update the codes array with the new code
        setCodes((prev) => prev.map((c) => (c.id === id ? code : c)));
        return code;
      } catch (err) {
        console.error("Failed to increment HOTP:", err);
        return undefined;
      }
    },
    []
  );

  return { codes, loading, getCode, incrementHotp, refresh: fetchCodes };
}
