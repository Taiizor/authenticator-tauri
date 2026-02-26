import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onNewAccount?: () => void;
  onSearch?: () => void;
  onLock?: () => void;
  onSettings?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "n") {
        e.preventDefault();
        handlers.onNewAccount?.();
      } else if (mod && e.key === "f") {
        e.preventDefault();
        handlers.onSearch?.();
      } else if (mod && e.key === "l") {
        e.preventDefault();
        handlers.onLock?.();
      } else if (mod && e.key === ",") {
        e.preventDefault();
        handlers.onSettings?.();
      } else if (e.key === "Escape") {
        handlers.onEscape?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, enabled]);
}
