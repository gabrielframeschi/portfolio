import type { Metadata } from "next";
import { Game } from "@/components/game";
import { site } from "@/content/site";

// Metadata merges shallowly, so the Open Graph fields are restated whole.
export const metadata: Metadata = {
  title: site.game.title,
  alternates: { canonical: "/play" },
  openGraph: {
    type: "website",
    url: "/play",
    siteName: site.name,
    title: `${site.game.title} · ${site.name}`,
    description: site.role,
  },
};

export default function Play() {
  return (
    // The whole screen is the field: no scrolling, zooming or text selection.
    <main className="fixed inset-0 touch-none overflow-hidden select-none">
      <h1 className="sr-only">{site.game.title}</h1>
      <p className="sr-only">{site.game.controls}</p>
      <Game labels={site.game} />
    </main>
  );
}
