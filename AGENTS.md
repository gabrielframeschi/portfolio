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
- No images in this version: no photos, illustrations, favicon or share images.
- A project's visuals belong to the project, not to the personal brand.

## Design tokens

- Every color, font, size, spacing and motion value comes from `src/styles/tokens.css`. Never hard-code them in components.
- One font size. Hierarchy comes from color (`text-fg` for what matters, `text-fg-muted` for the rest) and from weight, never from more sizes or fonts.
- Geist for almost everything. Roboto Serif only as a sparing highlight, today only the name. Geist Mono for monospaced text.
- No italics.
- Green is the only accent, and it appears only in the focus ring and in text selection.
- Space is the main material: never fill space just because it is empty.

## Motion

- CSS transitions first. Use Motion (motion.dev) only when CSS cannot do it. No GSAP.
- The approved movements are a closed list, implemented in `src/styles/motion.css`:
  1. Theme toggle: the sun and the moon swap in place with opacity, scale and a slight blur.
  2. Theme change: all colors change together in a short transition, with no flash and no expanding circle.
  3. Hover on links and project items: the text goes from gray to the strong color. Nothing moves.
  4. Page entrance: the blocks rise slightly into place, one right after another, fast.
- Ask before adding any other movement.
- Respect `prefers-reduced-motion`. Prefer `transform` and `opacity`.

## Theme

Light and dark. The site follows the visitor's system preference, and the toggle overrides it. `src/lib/theme.ts` applies the theme before the first paint, so the page never flashes.

## Commits

Conventional Commits in English: `feat:`, `fix:`, `chore:`, `docs:`.
