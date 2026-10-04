import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Serif } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { site } from "@/content/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-roboto-serif",
});

// Declared for monospaced text but not preloaded, so browsers only download
// it once something on the page uses it.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
});

const fontVariables = [geist.variable, robotoSerif.variable, geistMono.variable].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.role,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.name,
    description: site.role,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // ThemeScript sets data-theme on <html> before React hydrates.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg font-sans text-body text-fg-muted antialiased">{children}</body>
    </html>
  );
}
