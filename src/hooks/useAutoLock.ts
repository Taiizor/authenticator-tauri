import { useEffect, useRef, useCallback } from "react";

export function useAutoLock(
  minutes: number,
  isUnlocked: boolean,
  onLock: () => void
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (minutes > 0 && isUnlocked) {
      timeoutRef.current = setTimeout(onLock, minutes * 60 * 1000);
    }
  }, [minutes, isUnlocked, onLock]);

  useEffect(() => {
    if (!isUnlocked || minutes === 0) return;

    resetTimer();

    const events = ["mousedown", "keydown", "mousemove", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isUnlocked, minutes, resetTimer]);
}
