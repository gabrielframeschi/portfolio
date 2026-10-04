"use client";

import { themeScript } from "@/lib/theme";

/**
 * Applies the theme before the first paint. On client renders the script is
 * inert (text/plain), so React does not warn about rendering a script tag.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
