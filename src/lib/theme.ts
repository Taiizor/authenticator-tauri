export type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

let currentTheme: Theme = "system";
let mediaQuery: MediaQueryList | null = null;

function handleSystemThemeChange() {
  if (currentTheme === "system") {
    applyTheme("system");
  }
}

export function initTheme(theme: Theme) {
  currentTheme = theme;
  applyTheme(theme);

  // Listen for system theme changes
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleSystemThemeChange);
}

export async function setTheme(theme: Theme) {
  currentTheme = theme;
  applyTheme(theme);
}

export function getTheme(): Theme {
  return currentTheme;
}

export function getResolvedTheme(): "light" | "dark" {
  return currentTheme === "system" ? getSystemTheme() : currentTheme;
}

export function cleanupTheme() {
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
    mediaQuery = null;
  }
}
