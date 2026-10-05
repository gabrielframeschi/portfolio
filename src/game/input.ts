import type { Input } from "./world";

const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const FIRE_KEYS = ["Space"];
const GAME_KEYS = [...LEFT_KEYS, ...RIGHT_KEYS, ...FIRE_KEYS];

type Handlers = {
  /** A press that should wake a paused game. */
  onPress: () => void;
  onPauseKey: () => void;
  /** The page lost focus or was hidden. */
  onLeave: () => void;
};

/** Merges the mouse, the keyboard and touch into one Input. */
export function listen(canvas: HTMLCanvasElement, handlers: Handlers) {
  const input: Input = { pointer: null, mode: "pointer", turn: 0, fire: false, held: false };
  const held = { left: false, right: false, fireKey: false, pointer: false };
  // Only one pointer drives the ship, so a second finger cannot take over.
  let activePointer: number | null = null;

  function sync() {
    input.turn = held.right === held.left ? 0 : held.right ? 1 : -1;
    input.held = held.fireKey || held.pointer;
  }

  function locate(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    input.pointer = {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
    input.mode = "pointer";
  }

  function onPointerMove(event: PointerEvent) {
    // A mouse aims by hovering; a finger only aims while it touches the screen.
    if (event.pointerType === "touch" && event.pointerId !== activePointer) return;
    locate(event);
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || activePointer !== null) return;
    activePointer = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    locate(event);
    held.pointer = true;
    // A press fires at once. It stays set until the next step has seen it,
    // so a trackpad tap shorter than a frame still fires.
    input.fire = true;
    sync();
    handlers.onPress();
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    held.pointer = false;
    sync();
  }

  function onKey(event: KeyboardEvent) {
    const down = event.type === "keydown";

    if (event.code === "Escape") {
      if (down && !event.repeat) handlers.onPauseKey();
      return;
    }

    // Leave browser shortcuts alone.
    if (!GAME_KEYS.includes(event.code) || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();

    if (LEFT_KEYS.includes(event.code)) held.left = down;
    if (RIGHT_KEYS.includes(event.code)) held.right = down;
    if (FIRE_KEYS.includes(event.code)) held.fireKey = down;
    sync();
    // Holding a key repeats at the game's own pace, not the keyboard's.
    if (!down || event.repeat) return;

    if (FIRE_KEYS.includes(event.code)) input.fire = true;
    else input.mode = "keys";
    handlers.onPress();
  }

  // Keys released while the page is away never send keyup, so drop them all.
  function release() {
    held.left = held.right = held.fireKey = held.pointer = false;
    input.fire = false;
    activePointer = null;
    sync();
    handlers.onLeave();
  }

  function onVisibilityChange() {
    if (document.hidden) release();
  }

  function onContextMenu(event: Event) {
    event.preventDefault();
  }

  /** Call after each simulation step: the presses it saw are spent. */
  function endFrame() {
    input.fire = false;
  }

  window.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  window.addEventListener("blur", release);
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("contextmenu", onContextMenu);

  function dispose() {
    window.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("keyup", onKey);
    window.removeEventListener("blur", release);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    canvas.removeEventListener("contextmenu", onContextMenu);
  }

  return { input, endFrame, dispose };
}
