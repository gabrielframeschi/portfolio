import Link from "next/link";
import { site } from "@/content/site";
import { xWing } from "@/game/sprites";

export function Links({ className = "" }: { className?: string }) {
  const { width, height, path } = xWing;

  return (
    <ul className={`flex flex-wrap items-baseline gap-x-inline ${className}`}>
      {site.links.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="hover-strong hover-strong-text">
            {link.label}
          </a>
        </li>
      ))}
      {/*
       * The way into the game: a small X-Wing with no visible label. As tall as
       * a capital letter and sitting on the baseline, its solid shape weighs
       * about as much as the words beside it. The hit area reaches past it.
       */}
      <li className="ml-(--x-wing-offset)">
        <Link
          href="/play"
          aria-label={site.game.title}
          className="hover-strong hover-strong-text relative flex after:absolute after:-inset-2"
        >
          <svg
            aria-hidden="true"
            viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            // A fallback for browsers without the cap unit.
            width="0.64em"
            height="0.71em"
            shapeRendering="crispEdges"
            className="h-[1cap] w-auto fill-current"
          >
            <path d={path} />
          </svg>
        </Link>
      </li>
    </ul>
  );
}
