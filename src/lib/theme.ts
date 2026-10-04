export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// The favicon follows the theme chosen on the site. Its link is created here
// rather than in the metadata, so React never hydrates an attribute the
// script has changed. Without JavaScript, browsers use the default
// favicon.ico, which matches the light theme icon.
const ICON_ID = "theme-icon";
const ICONS: Record<Theme, string> = {
  light: "/icon.svg",
  dark: "/icon-dark-theme.svg",
};

/**
 * Runs in <head> before the first paint: applies the saved theme, or the
 * system one, so the page never shows the wrong colors, and points the
 * favicon at the matching icon.
 */
export const themeScript = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"dark":"light";document.documentElement.dataset.theme=t;var l=document.createElement("link");l.id=${JSON.stringify(ICON_ID)};l.rel="icon";l.type="image/svg+xml";l.href=${JSON.stringify(ICONS)}[t];document.head.appendChild(l)})()`;

/** The theme on <html>, which is the source of truth on the client. */
export function getAppliedTheme(): Theme | null {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : null;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  setThemeIcon(theme);
}

function setThemeIcon(theme: Theme) {
  let link = document.getElementById(ICON_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = ICON_ID;
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = ICONS[theme];
}

export function getSystemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function onSystemThemeChange(callback: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function getSavedTheme(): Theme | null {
  try {
    const theme = localStorage.getItem(STORAGE_KEY);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
}

/**
 * Saves the visitor's choice. A choice that matches the system is cleared
 * instead, so the site goes back to following the system.
 */
export function saveTheme(theme: Theme) {
  try {
    if (theme === getSystemTheme()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch {
    // Storage can be unavailable, as in some private modes. The choice then
    // lasts until the page is closed.
  }
}
