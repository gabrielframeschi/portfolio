"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { config } from "@/game/config";
import { runGame } from "@/game/game";
import { xWing } from "@/game/sprites";
import type { Hud } from "@/game/world";
import { syncTheme } from "@/lib/theme";

type GameLabels = {
  score: string;
  multiplier: string;
  best: string;
  lives: string;
  gameOver: string;
};

const initialHud: Hud = {
  score: 0,
  multiplier: 1,
  best: null,
  lives: config.lives,
  resting: true,
  over: false,
  paused: false,
};

type GameProps = {
  /** The site's name, which links home between games. */
  name: string;
  labels: GameLabels;
};

/** The canvas the game runs on, with the score, the lives and the way home over it. */
export function Game({ name, labels }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState(initialHud);

  // This page has no theme toggle, so it keeps the theme in sync on its own.
  useLayoutEffect(() => syncTheme(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return runGame(canvas, setHud);
  }, []);

  return (
    // Dimming on pause takes its time; play resuming snaps back.
    <div
      data-paused={hud.paused || undefined}
      className="absolute inset-0 transition-opacity duration-(--duration-resume) ease-(--ease-out) data-paused:opacity-(--pause-opacity) data-paused:duration-(--duration-pause)"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full cursor-crosshair" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-inline p-gutter font-mono">
        <p className="enter flex gap-x-inline">
          <span>
            <span className="sr-only">{labels.score} </span>
            {hud.score}
          </span>
          {hud.multiplier > 1 && (
            <span className="text-fg">
              <span className="sr-only">{labels.multiplier} </span>×{hud.multiplier}
            </span>
          )}
          {hud.best !== null && (
            <span>
              {labels.best} {hud.best}
            </span>
          )}
        </p>
        <Lives count={hud.lives} label={`${labels.lives} ${hud.lives}`} />
      </div>

      {/* The way home shows between games and steps aside while playing. */}
      <p
        data-hidden={!hud.resting || undefined}
        className="enter pointer-events-none absolute bottom-0 left-0 p-gutter transition-[opacity,visibility] duration-(--duration-hud) ease-(--ease-out) [--enter-index:2] data-hidden:invisible data-hidden:opacity-0"
      >
        <Link href="/" className="pointer-events-auto font-serif font-medium text-fg">
          {name}
        </Link>
      </p>

      <p aria-live="polite" className="sr-only">
        {hud.over &&
          [
            `${labels.gameOver}.`,
            `${labels.score} ${hud.score}.`,
            hud.best !== null && `${labels.best} ${hud.best}.`,
          ]
            .filter(Boolean)
            .join(" ")}
      </p>
    </div>
  );
}

/** One small X-Wing per life. A lost one fades and leaves its slot, so the others never shift. */
function Lives({ count, label }: { count: number; label: string }) {
  const { width, height, path } = xWing;
  const { pixel, gap } = config.lifeIcons;
  const total = config.lives * width + (config.lives - 1) * gap;
  const lost = config.lives - count;

  return (
    <p className="enter flex h-[1lh] items-center [--enter-index:1]">
      <span className="sr-only">{label}</span>
      <svg
        aria-hidden="true"
        viewBox={`${-width / 2} ${-height / 2} ${total} ${height}`}
        width={total * pixel}
        height={height * pixel}
        shapeRendering="crispEdges"
        className="fill-current"
      >
        {Array.from({ length: config.lives }, (_, index) => (
          <path
            key={index}
            d={path}
            transform={`translate(${index * (width + gap)} 0)`}
            opacity={index < lost ? 0 : 1}
            className="transition-opacity duration-(--duration-hud) ease-(--ease-out)"
          />
        ))}
      </svg>
    </p>
  );
}
