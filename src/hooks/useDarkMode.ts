"use client";

import { useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

type Theme = "light" | "dark" | "system";

export function useDarkMode() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "system");

  const getSystemDark = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  const isDark = theme === "dark" || (theme === "system" && getSystemDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const root = document.documentElement;
      if (mq.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, [setTheme]);

  return { theme, setTheme, isDark, cycleTheme };
}
