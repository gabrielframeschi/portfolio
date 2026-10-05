import { config } from "./config";
import { sprites } from "./enemies";
import { xWing, type Sprite } from "./sprites";
import { hasShip, type World } from "./world";

/** Theme colors, read from the tokens on every frame so the canvas follows theme changes. */
export type Palette = { fg: string; laser: string };

// Path2D only exists in the browser, so the paths are built on first use.
const paths = new Map<Sprite, Path2D>();

function pathOf(sprite: Sprite) {
  let path = paths.get(sprite);
  if (!path) {
    path = new Path2D(sprite.path);
    paths.set(sprite, path);
  }
  return path;
}

export function render(ctx: CanvasRenderingContext2D, world: World, palette: Palette, scale: number) {
  const { width, height, pixel } = world.field;
  const cx = width / 2;
  const cy = height / 2;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = palette.fg;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  for (const particle of world.particles) {
    ctx.globalAlpha = 1 - particle.age / particle.life;
    ctx.fillRect(cx + particle.x - pixel / 2, cy + particle.y - pixel / 2, pixel, pixel);
  }

  ctx.globalAlpha = world.phase === "over" ? fadeOut(world) : 1;
  for (const enemy of world.enemies) {
    if (enemy.delay > 0) continue;
    ctx.fillStyle = enemy.flash > 0 ? palette.laser : palette.fg;
    drawUpright(ctx, sprites[enemy.kind], cx + enemy.x, cy + enemy.y, pixel, scale);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.laser;
  const length = config.bolt.length * pixel;
  for (const bolt of world.bolts) {
    ctx.setTransform(scale, 0, 0, scale, (cx + bolt.x) * scale, (cy + bolt.y) * scale);
    ctx.rotate(bolt.angle + Math.PI / 2);
    ctx.fillRect(-pixel / 2, -length / 2, pixel, length);
  }

  if (hasShip(world)) {
    ctx.globalAlpha = world.shield > 0 ? config.ship.shieldOpacity : 1;
    ctx.fillStyle = palette.fg;
    ctx.setTransform(scale, 0, 0, scale, cx * scale, cy * scale);
    ctx.rotate(world.angle + Math.PI / 2);
    ctx.scale(pixel, pixel);
    ctx.fill(pathOf(xWing));
  }

  ctx.globalAlpha = 1;
}

/** Enemies never turn, so their pixels can sit on whole device pixels and stay crisp. */
function drawUpright(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  pixel: number,
  scale: number,
) {
  const size = Math.round(pixel * scale);
  const left = Math.round(x * scale - (sprite.width / 2) * size);
  const top = Math.round(y * scale - (sprite.height / 2) * size);
  ctx.setTransform(size, 0, 0, size, left + (sprite.width / 2) * size, top + (sprite.height / 2) * size);
  ctx.fill(pathOf(sprite));
}

/** The enemies left on the field fade out when the game ends. */
function fadeOut(world: World) {
  const { delay, fade } = config.gameOver;
  return Math.max(0, Math.min(1, (world.timer - (delay - fade)) / fade));
}
