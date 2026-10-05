"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
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

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4",
} as const;

function SunIcon() {
  return (
    <svg data-icon="sun" {...iconProps}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg data-icon="moon" {...iconProps}>
      <path d="M20.49 12.49A8.5 8.5 0 1 1 11.51 3.51A6.5 6.5 0 0 0 20.49 12.49Z" />
    </svg>
  );
}
