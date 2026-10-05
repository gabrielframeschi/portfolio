"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { applyTheme, getAppliedTheme, saveTheme, syncTheme } from "@/lib/theme";

// React only reads the theme from <html>, which the head script sets first.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, getAppliedTheme, () => null);

  useLayoutEffect(() => syncTheme(), []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    saveTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={theme === null ? undefined : theme === "dark"}
      onClick={toggle}
      className="theme-toggle press relative grid size-[1lh] shrink-0 cursor-pointer place-items-center after:absolute after:-inset-2"
    >
      <span className="icon-swap" aria-hidden="true">
        <SunIcon />
        <MoonIcon />
      </span>
    </button>
  );
}
