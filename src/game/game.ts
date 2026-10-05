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

  // A game in another tab can set a higher record.
  const onStorage = (event: StorageEvent) => {
    if (event.key === BEST_KEY) world.best = Math.max(world.best, loadBest());
  };
  window.addEventListener("storage", onStorage);

  // A record beaten mid-game is saved when the page goes out of view, so
  // closing the tab never loses it.
  const onHide = () => {
    if (document.visibilityState === "hidden" && world.score > world.best) {
      world.best = saveBest(world.score);
    }
  };
  document.addEventListener("visibilitychange", onHide);

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
  // Show the saved record at once, without waiting for the first frame.
  let shown = getHud(world);
  onHud(shown);
  let last = performance.now();

  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, config.maxStep);
    last = now;
    // Zooming or moving to another screen changes the pixel ratio without a resize.
    if (window.devicePixelRatio !== scale) resize();

    const wasOver = world.phase === "over";
    update(world, input, dt);
    endFrame();
    if (!wasOver && world.phase === "over") world.best = saveBest(world.best);

    palette.fg = style.getPropertyValue("--theme-fg");
    palette.laser = style.getPropertyValue("--theme-laser");
    render(ctx, world, palette, scale);

    const hud = getHud(world);
    if (!isSameHud(shown, hud)) {
      shown = hud;
      onHud(hud);
    }

    frame = requestAnimationFrame(loop);
  };
  let frame = requestAnimationFrame(loop);

  return () => {
    // Leaving mid-game, as through the way out, keeps a record beaten so far.
    if (world.score > world.best) saveBest(world.score);
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener("change", onMotionChange);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onHide);
    dispose();
  };
}

function isSameHud(a: Hud, b: Hud) {
  return (
    a.score === b.score &&
    a.multiplier === b.multiplier &&
    a.best === b.best &&
    a.lives === b.lives &&
    a.regained === b.regained &&
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

/** Saves the record and returns it. Another tab may have saved a higher one meanwhile. */
function saveBest(best: number) {
  const record = Math.max(best, loadBest());
  try {
    localStorage.setItem(BEST_KEY, String(record));
  } catch {
    // Storage can be unavailable, as in some private modes. The best score
    // then lasts until the page is closed.
  }
  return record;
}
