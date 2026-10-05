/**
 * Gameplay tuning. Speeds are in field radii per second (half the shorter
 * side of the screen), so a game plays the same on a phone and on a wide
 * monitor. Sizes are in sprite pixels and times in seconds.
 */
export const config = {
  lives: 3,
  /** A lost ship comes back at every multiple of this score. */
  extraLifeEvery: 10_000,
  /** Longest step the simulation takes, so a stalled frame never teleports anything. */
  maxStep: 1 / 30,
  /** One sprite pixel in CSS pixels: the field radius divided by this, clamped. */
  pixel: { divisor: 180, min: 1.25, max: 3 },
  /** Room past the screen edge where ships appear and leave. */
  edgeMargin: 12,

  ship: {
    /** Turn speed while following the pointer, in radians per second. */
    aimTurnSpeed: 18,
    /** Turn speed while a turn key is held, in radians per second. */
    keyTurnSpeed: 4.5,
    /** Below this distance from the center, the pointer gives no clear direction. */
    deadZone: 6,
    hitRadius: 3.5,
    respawnDelay: 1,
    /** After a respawn, crashes only destroy the enemy for this long. */
    shieldTime: 2,
    shieldOpacity: 0.4,
  },

  /** Each volley fires both wingtip cannons at once, in two straight lines. */
  bolt: {
    speed: 2.4,
    /**
     * Holding the trigger repeats a volley this often, while every press fires
     * at once: quick fingers can outshoot the hold.
     */
    repeat: 0.15,
    /** The right cannon's tip, from the ship's center; the left one mirrors it. */
    muzzle: { x: 4, y: -3 },
    length: 4,
  },

  /** Volleys that hit in a row raise the multiplier by one every `step`; a miss resets it. */
  combo: { step: 5, max: 5 },

  enemies: {
    fighter: { hp: 1, score: 100, hitRadius: 5 },
    interceptor: {
      hp: 1,
      score: 200,
      hitRadius: 5,
      /** Relative to the fighters of the moment. */
      speed: 1.35,
      /** Side to side, in field radii, fading as it closes in. */
      weave: { amplitude: 0.1, frequency: 1.1 },
    },
    advanced: {
      hp: 3,
      score: 1000,
      hitRadius: 6,
      speed: 0.3,
      /** It crosses the field without aiming at the ship, passing this far from it. */
      miss: { from: 0.35, to: 0.6 },
      firstAt: 40,
      every: 30,
    },
  },

  waves: {
    firstDelay: 0.6,
    /** Time between waves, from the first to the fastest pace. */
    interval: { from: 1.3, to: 0.55 },
    /** Fighter speed over the same ramp. */
    speed: { from: 0.24, to: 0.4 },
    rampTime: 120,
    /** When each kind of wave starts to appear, and how often it is picked after that. */
    single: { from: 0, weight: 4 },
    pair: { from: 8, weight: 2 },
    formation: {
      from: 18,
      weight: 1.5,
      size: { min: 3, max: 5 },
      /** Time between ships on the same path. */
      spacing: 0.25,
      /** Spiral turn, in radians per second. */
      turn: 0.5,
    },
    interceptor: { from: 30, weight: 1.5 },
  },

  explosion: { life: 0.6, speed: { min: 0.1, max: 0.3 }, inherit: 0.3 },
  /** A hit that does not destroy flashes the enemy in the laser color. */
  hitFlash: 0.12,

  /**
   * The lives in the corner: small X-Wings at whole CSS pixels per sprite
   * pixel, so they stay crisp, with a gap between them in sprite pixels. A
   * life won back gathers from pixels that start this far out.
   */
  lifeIcons: { pixel: 2, gap: 3, gather: { from: 4, to: 8 } },

  /** From the last crash until the ship is back for a new game. */
  gameOver: { delay: 1.6, fade: 0.5 },
} as const;
