# gabrielframeschi.com

Personal website of Gabriel Frameschi.

## Stack

Next.js (App Router), React, TypeScript and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Other scripts: `npm run build`, `npm run start` and `npm run lint`.

Project dates come from the GitHub API, which allows 60 anonymous requests per hour. To raise the limit, copy `.env.example` to `.env.local` and set `GITHUB_TOKEN`.

## Structure

- `src/content/site.ts`: all copy and links.
- `src/styles/tokens.css`: design tokens for color, type, spacing and motion.
- `src/styles/motion.css`: the approved movements.
- `src/components/`: the page blocks and the theme toggle.
- `src/lib/`: GitHub data and theme helpers.
