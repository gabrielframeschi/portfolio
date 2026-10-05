import { config } from "./config";
import { listen } from "./input";
import { render, type Palette } from "./render";
import { createField, createWorld, getHud, pause, update, type Hud } from "./world";

const BEST_KEY = "best-score";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Runs the game on a canvas until the returned function is called. */
export function runGame(canvas: HTMLCanvasElement, onHud: (hud: Hud) => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const world = createWorld(createField(1, 1, 1), loadBest());
  let scale = 1;

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    world.field = createField(width, height, scale);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const motion = window.matchMedia(REDUCED_MOTION);
  const onMotionChange = () => {
    world.reducedMotion = motion.matches;
  };
  motion.addEventListener("change", onMotionChange);
  onMotionChange();

  const { input, endFrame, dispose } = listen(canvas, {
    onPress: () => {
      world.paused = false;
    },
    onPauseKey: () => {
      if (world.paused) world.paused = false;
      else pause(world);
    },
    onLeave: () => pause(world),
  });

  const style = getComputedStyle(document.documentElement);
  const palette: Palette = { fg: "", laser: "" };
  let shown: Hud | null = null;
  let last = performance.now();

  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, config.maxStep);
    last = now;
    // Zooming or moving to another screen changes the pixel ratio without a resize.
    if (window.devicePixelRatio !== scale) resize();

    const wasOver = world.phase === "over";
    update(world, input, dt);
    endFrame();
    if (!wasOver && world.phase === "over") saveBest(world.best);

    palette.fg = style.getPropertyValue("--theme-fg");
    palette.laser = style.getPropertyValue("--theme-laser");
    render(ctx, world, palette, scale);

    const hud = getHud(world);
    if (!shown || !isSameHud(shown, hud)) {
      shown = hud;
      onHud(hud);
    }

    frame = requestAnimationFrame(loop);
  };
  let frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener("change", onMotionChange);
    dispose();
  };
}

function isSameHud(a: Hud, b: Hud) {
  return (
    a.score === b.score &&
    a.multiplier === b.multiplier &&
    a.best === b.best &&
    a.lives === b.lives &&
    a.resting === b.resting &&
    a.over === b.over &&
    a.paused === b.paused
  );
}

function loadBest() {
  try {
    const best = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(best) ? best : 0;
  } catch {
    return 0;
  }
}

function saveBest(best: number) {
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Storage can be unavailable, as in some private modes. The best score
    // then lasts until the page is closed.
  }
}
