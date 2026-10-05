import { config } from "./config";
import { explode, moveParticles, type Particle } from "./effects";
import { isLeaving, moveEnemy, spawnEnemies, sprites, type Enemy } from "./enemies";
import { toWorld, wrap, type Vec } from "./geometry";
import { xWing } from "./sprites";

/** The visible area. Positions are measured from its center, where the X-Wing sits. */
export type Field = {
  width: number;
  height: number;
  /** Half the shorter side, in CSS pixels. Speeds are measured in it. */
  radius: number;
  /** One sprite pixel, in CSS pixels: always whole device pixels, so sprites stay crisp. */
  pixel: number;
};

/**
 * ready: the ship waits at the center and the first shot starts a game.
 * respawning: the ship was hit and comes back after a short delay.
 * over: the last ship was hit; the field clears before the next game.
 */
export type Phase = "ready" | "playing" | "respawning" | "over";

/** The two bolts of one press. It hits if either bolt does, and misses only if both fly off. */
type Volley = { bolts: number; hit: boolean };

/** A bolt keeps its previous position to test hits along its whole step. */
export type Bolt = Vec & { px: number; py: number; vx: number; vy: number; angle: number; volley: Volley };

export type Input = {
  /** The pointer, from the center. Null until it first moves. */
  pointer: Vec | null;
  /** The control used last: the pointer aims directly, the keys turn. */
  mode: "pointer" | "keys";
  turn: -1 | 0 | 1;
  /** A fire press since the last step: it fires at once. */
  fire: boolean;
  /** The trigger is held down: it repeats at a steady pace. */
  held: boolean;
};

export type World = {
  field: Field;
  phase: Phase;
  paused: boolean;
  /** Explosions fade in place instead of flying apart. */
  reducedMotion: boolean;
  /** Where the ship points, in radians clockwise from the right. */
  angle: number;
  /** Time until a held trigger fires again. */
  repeat: number;
  shield: number;
  /** Counts down the respawning and over phases. */
  timer: number;
  /** Time played in this game, which sets the difficulty. */
  elapsed: number;
  waveTimer: number;
  advancedTimer: number;
  score: number;
  best: number;
  lives: number;
  /** Volleys in a row that hit something. */
  streak: number;
  bolts: Bolt[];
  enemies: Enemy[];
  particles: Particle[];
};

/** What the page shows over the canvas. */
export type Hud = {
  score: number;
  multiplier: number;
  /** The record, shown at all times once there is a saved one. It climbs with a score that beats it. */
  best: number | null;
  lives: number;
  /** Between games: before the first one, or once the last ship is down. */
  resting: boolean;
  over: boolean;
  paused: boolean;
};

export function createField(width: number, height: number, scale: number): Field {
  const radius = Math.min(width, height) / 2;
  const { divisor, min, max } = config.pixel;
  const size = Math.min(max, Math.max(min, radius / divisor));
  const pixel = Math.max(1, Math.round(size * scale)) / scale;
  return { width, height, radius, pixel };
}

export function createWorld(field: Field, best: number): World {
  return {
    field,
    phase: "ready",
    paused: false,
    reducedMotion: false,
    angle: -Math.PI / 2,
    repeat: 0,
    shield: 0,
    timer: 0,
    elapsed: 0,
    waveTimer: 0,
    advancedTimer: 0,
    score: 0,
    best,
    lives: config.lives,
    streak: 0,
    bolts: [],
    enemies: [],
    particles: [],
  };
}

export function update(world: World, input: Input, dt: number) {
  if (world.paused) return;
  aim(world, input, dt);
  fire(world, input, dt);
  if (isInGame(world)) spawnEnemies(world, dt);
  move(world, dt);
  collide(world, dt);
  tick(world, dt);
}

/** Pausing only matters while a game is running. */
export function pause(world: World) {
  if (isInGame(world)) world.paused = true;
}

export function hasShip(world: World) {
  return world.phase === "ready" || world.phase === "playing";
}

export function getHud(world: World): Hud {
  const resting = world.phase === "ready" || world.phase === "over";
  return {
    score: world.score,
    multiplier: isInGame(world) ? multiplier(world) : 1,
    best: world.best > 0 ? Math.max(world.best, world.score) : null,
    lives: world.lives,
    resting,
    over: world.phase === "over",
    paused: world.paused,
  };
}

function isInGame(world: World) {
  return world.phase === "playing" || world.phase === "respawning";
}

function multiplier(world: World) {
  const { step, max } = config.combo;
  return Math.min(max, 1 + Math.floor(world.streak / step));
}

function aim(world: World, input: Input, dt: number) {
  const { ship } = config;

  if (input.mode === "keys") {
    world.angle = wrap(world.angle + input.turn * ship.keyTurnSpeed * dt);
    return;
  }

  const target = pointerAngle(world, input);
  if (target === null) return;
  const turn = wrap(target - world.angle);
  const step = ship.aimTurnSpeed * dt;
  world.angle = wrap(world.angle + Math.max(-step, Math.min(step, turn)));
}

function pointerAngle(world: World, { pointer }: Input) {
  // Too close to the center, the pointer gives no clear direction.
  if (!pointer || Math.hypot(pointer.x, pointer.y) < config.ship.deadZone * world.field.pixel) return null;
  return Math.atan2(pointer.y, pointer.x);
}

function fire(world: World, input: Input, dt: number) {
  if (!hasShip(world)) return;
  const { repeat } = config.bolt;

  if (input.fire) {
    // Only a fresh press starts a game, never a trigger still held from the last one.
    if (world.phase === "ready") start(world);
    // A press turns the ship at once, so a click or a tap fires where it lands.
    const target = input.mode === "pointer" ? pointerAngle(world, input) : null;
    if (target !== null) world.angle = target;
    world.repeat = repeat;
    volley(world);
    return;
  }

  if (!input.held || world.phase !== "playing") return;
  world.repeat -= dt;
  if (world.repeat > 0) return;
  world.repeat += repeat;
  volley(world);
}

/** Fires both wingtip cannons along the way the ship points. */
function volley(world: World) {
  const { pixel, radius } = world.field;
  const { muzzle, speed } = config.bolt;
  const vx = Math.cos(world.angle) * speed * radius;
  const vy = Math.sin(world.angle) * speed * radius;
  const shot: Volley = { bolts: 2, hit: false };

  for (const side of [-1, 1]) {
    const tip = toWorld(side * muzzle.x, muzzle.y, world.angle);
    const x = tip.x * pixel;
    const y = tip.y * pixel;
    world.bolts.push({ x, y, px: x, py: y, vx, vy, angle: world.angle, volley: shot });
  }
}

function start(world: World) {
  world.phase = "playing";
  world.score = 0;
  world.streak = 0;
  world.lives = config.lives;
  world.elapsed = 0;
  world.waveTimer = config.waves.firstDelay;
  world.advancedTimer = config.enemies.advanced.firstAt;
  world.shield = 0;
  world.bolts = [];
  world.enemies = [];
}

function move(world: World, dt: number) {
  for (const bolt of world.bolts) {
    bolt.px = bolt.x;
    bolt.py = bolt.y;
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
  }

  for (const enemy of world.enemies) moveEnemy(enemy, world.field, dt);
  moveParticles(world, dt);

  world.bolts = world.bolts.filter((bolt) => {
    if (isOnField(world.field, bolt)) return true;
    spend(world, bolt.volley);
    return false;
  });
  world.enemies = world.enemies.filter((enemy) => !isLeaving(enemy, world.field));
}

function collide(world: World, dt: number) {
  const { pixel } = world.field;

  // Once the game is over, the last bolts fly through the fading enemies.
  if (isInGame(world)) {
    world.bolts = world.bolts.filter((bolt) => {
      const target = world.enemies.find(
        (enemy) =>
          enemy.hp > 0 &&
          enemy.delay <= 0 &&
          segmentHitsCircle(bolt, enemy, config.enemies[enemy.kind].hitRadius * pixel),
      );
      if (!target) return true;
      hit(world, bolt, target, dt);
      return false;
    });
  }

  if (world.phase === "playing") {
    for (const enemy of world.enemies) {
      if (enemy.hp <= 0 || enemy.delay > 0) continue;
      const reach = (config.enemies[enemy.kind].hitRadius + config.ship.hitRadius) * pixel;
      if (Math.hypot(enemy.x, enemy.y) > reach) continue;
      enemy.hp = 0;
      explode(world, sprites[enemy.kind], { x: enemy.x, y: enemy.y, angle: null });
      if (world.shield > 0) continue;
      crash(world);
      break;
    }
  }

  world.enemies = world.enemies.filter((enemy) => enemy.hp > 0);
}

function hit(world: World, bolt: Bolt, enemy: Enemy, dt: number) {
  if (!bolt.volley.hit) {
    bolt.volley.hit = true;
    world.streak += 1;
  }
  spend(world, bolt.volley);

  enemy.hp -= 1;
  if (enemy.hp > 0) {
    enemy.flash = config.hitFlash;
    return;
  }

  addScore(world, config.enemies[enemy.kind].score * multiplier(world));
  explode(world, sprites[enemy.kind], {
    x: enemy.x,
    y: enemy.y,
    angle: null,
    vx: dt > 0 ? (enemy.x - enemy.px) / dt : 0,
    vy: dt > 0 ? (enemy.y - enemy.py) / dt : 0,
  });
}

/** A bolt is gone. Once both of a volley are gone without a hit, the streak breaks. */
function spend(world: World, volley: Volley) {
  volley.bolts -= 1;
  if (volley.bolts === 0 && !volley.hit) world.streak = 0;
}

function addScore(world: World, points: number) {
  const before = world.score;
  world.score += points;
  const every = config.extraLifeEvery;
  if (Math.floor(world.score / every) > Math.floor(before / every)) {
    world.lives = Math.min(config.lives, world.lives + 1);
  }
}

function crash(world: World) {
  explode(world, xWing, { x: 0, y: 0, angle: world.angle });
  world.streak = 0;
  world.lives -= 1;

  if (world.lives > 0) {
    world.phase = "respawning";
    world.timer = config.ship.respawnDelay;
  } else {
    world.phase = "over";
    world.timer = config.gameOver.delay;
    world.best = Math.max(world.best, world.score);
  }
}

function tick(world: World, dt: number) {
  world.shield = Math.max(0, world.shield - dt);

  if (world.phase !== "respawning" && world.phase !== "over") return;
  world.timer -= dt;
  if (world.timer > 0) return;

  if (world.phase === "respawning") {
    world.phase = "playing";
    world.shield = config.ship.shieldTime;
  } else {
    world.phase = "ready";
    world.lives = config.lives;
    world.bolts = [];
    world.enemies = [];
  }
}

function isOnField(field: Field, { x, y }: Vec) {
  const margin = config.edgeMargin * field.pixel;
  return Math.abs(x) <= field.width / 2 + margin && Math.abs(y) <= field.height / 2 + margin;
}

function segmentHitsCircle(bolt: Bolt, center: Vec, radius: number) {
  const dx = bolt.x - bolt.px;
  const dy = bolt.y - bolt.py;
  const length = dx * dx + dy * dy;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((center.x - bolt.px) * dx + (center.y - bolt.py) * dy) / length));
  return Math.hypot(bolt.px + t * dx - center.x, bolt.py + t * dy - center.y) <= radius;
}
