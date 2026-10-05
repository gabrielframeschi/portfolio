<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

Gabriel Frameschi's personal website. It starts minimal and grows only when there is something real to add.

## Content

- English everywhere: content, code, comments and docs.
- All copy and links live in `src/content/site.ts`.
- Never invent content. New text goes in as a draft and is flagged for review.
- No empty sections and no "coming soon". A section exists only once it has real content.
- No images in this version besides the favicon set in `public/` and the game's pixel art (see Game): no photos, illustrations or share images.
- A project's visuals belong to the project, not to the personal brand.

## Design tokens

- Every color, font, size, spacing and motion value comes from `src/styles/tokens.css`. Never hard-code them in components.
- One font size. Hierarchy comes from color (`text-fg` for what matters, `text-fg-muted` for the rest) and from weight, never from more sizes or fonts.
- Geist for almost everything. Roboto Serif only as a sparing highlight, today only the name. Geist Mono for monospaced text.
- No italics.
- Green is the only accent, and it appears only in the focus ring, in text selection and in the favicon.
- Space is the main material: never fill space just because it is empty.

## Motion

- CSS transitions first. Use Motion (motion.dev) only when CSS cannot do it. No GSAP.
- The approved movements are a closed list, implemented in `src/styles/motion.css`:
  1. Theme toggle: the sun and the moon swap in place with opacity, scale and a slight blur.
  2. Theme change: all colors change together in a short transition, with no flash and no expanding circle.
  3. Hover on links and project items: the text goes from gray to the strong color. Nothing moves.
  4. Page entrance: the blocks rise slightly into place, one right after another, fast. They stay visible from the first frame.
  5. Press on the theme toggle: it sinks slightly while pressed and snaps back.
- Ask before adding any other movement. The game has its own motion rules (see Game).
- Respect `prefers-reduced-motion`: drop movement, keep opacity and color changes. Prefer `transform` and `opacity`.

## Theme

Light and dark. The site follows the visitor's system preference, and the toggle overrides it. `src/lib/theme.ts` applies the theme before the first paint, so the page never flashes.

The favicon follows the theme chosen on the site: `public/icon.svg` for the light theme, which is also the default, and `public/icon-dark-theme.svg` for the dark one. `favicon.ico` (for browsers without SVG favicons) and `apple-touch-icon.png` are fixed and match the light theme icon. The icon is a squircle (superellipse, n = 4) with a frame drawn on a 4 × 4 grid of 2-unit modules, so it stays sharp at 16 and 32 px.

## Game

`/play` is a small arcade game: an X-Wing fixed at the center turns and fires at TIE fighters. The rules above apply, with these exceptions:

- Way in: an easter egg, never an explicit link. A small pixel X-Wing with no visible label closes the links on the home page, with the same hover as the other links.
- Way back: while paused and between games, "Exit" with a left arrow sits at the bottom center and links home, with the same hover as the links on the home page. It steps aside while playing.
- HUD: the score sits at the top center in the strong color, with the multiplier beside it. The best score sits at the top left and the lives at the top right, in the muted color. While paused, everything dims except the way out.
- Pixel art: the ships are pixel grids in `src/game/sprites.ts`, rendered as SVG paths. The X-Wing turns; the TIEs stay upright on whole device pixels, so they stay crisp.
- Color: red (`--theme-laser`) is the game's one signal color: the X-Wing's lasers, a TIE hit that did not go down, and a life just lost. It appears nowhere else on the site. Green stays out of the game.
- Text: the screen shows only the score, the multiplier, the best score and the way out, in Geist Mono at the one font size. The controls are described for screen readers only.
- Motion: everything inside the canvas is gameplay and sits outside the closed list. Around it, the HUD uses the approved page entrance and the motion in `src/styles/game.css`: the pause dims the field, a lost life turns red for a moment and fades, and a life won back gathers from its own pixels, all timed by tokens. With `prefers-reduced-motion`, explosions fade in place instead of flying apart and a life won back only fades in, while play itself still moves.
- Values: gameplay values (speeds, timings, sprite sizes, difficulty) live in `src/game/config.ts`. Colors still come from `tokens.css`, and the canvas reads them on every frame so it follows theme changes.
- Code: the engine in `src/game/` is plain TypeScript with no React. `src/components/game.tsx` mounts it and draws the HUD.

## Commits

Conventional Commits in English: `feat:`, `fix:`, `chore:`, `docs:`.
