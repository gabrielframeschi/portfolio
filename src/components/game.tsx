"use client";

import Link from "next/link";
import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeftIcon } from "@/components/icons";
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
  exit: string;
};

const initialHud: Hud = {
  score: 0,
  multiplier: 1,
  best: null,
  lives: config.lives,
  regained: 0,
  regainedTo: 0,
  resting: true,
  over: false,
  paused: false,
};

// While paused, the field and the numbers dim over the pause time and snap
// back when play resumes. The way out stays bright.
const dimOnPause =
  "transition-opacity duration-(--duration-resume) ease-(--ease-out) group-data-paused:opacity-(--pause-opacity) group-data-paused:duration-(--duration-pause)";

/** The canvas the game runs on, with the score, the lives and the way out over it. */
export function Game({ labels }: { labels: GameLabels }) {
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
    <div data-paused={hud.paused || undefined} className="group absolute inset-0">
      <canvas ref={canvasRef} className={`absolute inset-0 size-full cursor-crosshair ${dimOnPause}`} />

      {/* The score sits in the middle, where a glance finds it; the record and the lives sit at the sides. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 grid grid-cols-[1fr_auto_1fr] items-start gap-x-inline p-gutter font-mono">
        <p className={`enter justify-self-start ${dimOnPause}`}>
          {hud.best !== null && `${labels.best} ${hud.best}`}
        </p>

        <p className={`enter relative text-fg [--enter-index:1] ${dimOnPause}`}>
          <span className="sr-only">{labels.score} </span>
          {hud.score}
          {/* Beside the score, so the score itself never moves. */}
          {hud.multiplier > 1 && (
            <span className="absolute left-full ml-inline whitespace-nowrap">
              <span className="sr-only">{labels.multiplier} </span>×{hud.multiplier}
            </span>
          )}
        </p>

        <Lives
          count={hud.lives}
          regained={hud.regained}
          regainedTo={hud.regainedTo}
          label={`${labels.lives} ${hud.lives}`}
          className={`enter justify-self-end [--enter-index:2] ${dimOnPause}`}
        />
      </div>

      {/* The way out sits at the bottom center while paused and between games. */}
      <p
        data-hidden={!(hud.paused || hud.resting) || undefined}
        className="enter pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-gutter font-mono transition-[opacity,visibility] duration-(--duration-pause) ease-(--ease-out) [--enter-index:3] data-hidden:invisible data-hidden:opacity-0 data-hidden:duration-(--duration-resume)"
      >
        <Link
          href="/"
          className="hover-strong hover-strong-text pointer-events-auto flex items-center gap-[1ch]"
        >
          <ArrowLeftIcon />
          {labels.exit}
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

/*
 * Each life is drawn pixel by pixel, so a life won back can gather from its
 * own pixels, like an explosion running backwards. Every pixel starts a
 * little further out along its own direction, with a fixed spread so the
 * server and the browser draw the same thing.
 */
const lifePixels = xWing.pixels.map((pixel, index) => {
  const { from, to } = config.lifeIcons.gather;
  const reach = from + ((to - from) * ((index * 37) % 11)) / 10;
  const distance = Math.hypot(pixel.x, pixel.y);
  return {
    x: pixel.x - 0.5,
    y: pixel.y - 0.5,
    style: {
      "--gather-x": `${((pixel.x / distance) * reach).toFixed(2)}px`,
      "--gather-y": `${((pixel.y / distance) * reach).toFixed(2)}px`,
    } as CSSProperties,
  };
});

type LivesProps = {
  count: number;
  regained: number;
  regainedTo: number;
  label: string;
  className: string;
};

/**
 * One small X-Wing per life. A lost one turns red, then fades and leaves its
 * slot, so the others never shift. Lives go from the left.
 */
const Lives = memo(function Lives({ count, regained, regainedTo, label, className }: LivesProps) {
  const { width, height } = xWing;
  const { pixel, gap } = config.lifeIcons;
  const total = config.lives * width + (config.lives - 1) * gap;
  const lost = config.lives - count;
  const gathering = regained > 0 ? config.lives - regainedTo : -1;

  return (
    <p className={`flex h-[1lh] items-center ${className}`}>
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
          <g
            // A new key for each life won back replays its gathering.
            key={index === gathering ? `${index}-${regained}` : `${index}`}
            data-lost={index < lost || undefined}
            data-gathering={index === gathering || undefined}
            className="life"
            transform={`translate(${index * (width + gap)} 0)`}
          >
            {lifePixels.map(({ x, y, style }) => (
              <rect key={`${x} ${y}`} x={x} y={y} width={1} height={1} style={style} />
            ))}
          </g>
        ))}
      </svg>
    </p>
  );
});
