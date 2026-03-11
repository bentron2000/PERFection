import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { darkTokens, lightTokens, type ThemeTokens } from "./tokens";

type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  toggle: () => void;
}

const STORAGE_KEY = "perfection-theme";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  tokens: darkTokens,
  toggle: () => {},
});

function loadMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(loadMode);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const tokens = mode === "dark" ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ mode, tokens, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
