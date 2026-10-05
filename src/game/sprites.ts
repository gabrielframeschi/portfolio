/**
 * Pixel art, one string per row: "#" is a filled pixel. Coordinates are
 * centered, so (0, 0) is the middle of the sprite.
 */
export type Sprite = {
  width: number;
  height: number;
  /** SVG path data, shared by the canvas (Path2D) and the lives in the page. */
  path: string;
  /** The center of every filled pixel, for explosions. */
  pixels: readonly { x: number; y: number }[];
};

function sprite(rows: readonly string[]): Sprite {
  const height = rows.length;
  const width = rows[0].length;
  const left = -width / 2;
  const top = -height / 2;
  let path = "";
  const pixels: { x: number; y: number }[] = [];

  rows.forEach((row, y) => {
    // One rectangle per run of filled pixels keeps the path short.
    for (const run of row.matchAll(/#+/g)) {
      path += `M${left + run.index} ${top + y}h${run[0].length}v1h${-run[0].length}z`;
    }
    for (let x = 0; x < width; x++) {
      if (row[x] === "#") pixels.push({ x: left + x + 0.5, y: top + y + 0.5 });
    }
  });

  return { width, height, path, pixels };
}

/** Seen from above, nose up: it turns to aim. Cannons on both wingtips. */
export const xWing = sprite([
  "....#....",
  "....#....",
  "#...#...#",
  "#...#...#",
  "#..###..#",
  "#..###..#",
  "#.#####.#",
  "#########",
  "#########",
  "..##.##..",
]);

/** Seen from the front, coming at the X-Wing: the wings frame the cockpit. */
export const tieFighter = sprite([
  "#.......#",
  "#.......#",
  "#..###..#",
  "####.####",
  "#..###..#",
  "#.......#",
  "#.......#",
]);

/** Its dagger wings bend toward the cockpit. */
export const tieInterceptor = sprite([
  ".#.....#.",
  "#.......#",
  "#..###..#",
  "####.####",
  "#..###..#",
  "#.......#",
  ".#.....#.",
]);

/** Darth Vader's TIE Advanced: bigger, with bent wings and a wider body. */
export const tieAdvanced = sprite([
  "#.........#",
  ".#.......#.",
  ".#..###..#.",
  ".#.#####.#.",
  ".####.####.",
  ".#.#####.#.",
  ".#..###..#.",
  ".#.......#.",
  "#.........#",
]);
