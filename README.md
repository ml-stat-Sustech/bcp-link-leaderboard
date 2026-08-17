# BCP-Link Leaderboard

A bilingual static leaderboard for the BCP-Link search-agent benchmark. The site reads the
committed results CSV, presents the BCP-Link ranking, compares BCP with BCP-Link, and documents the
shared evaluation tools and metrics.

Live site: <https://ml-stat-sustech.github.io/bcp-link-leaderboard/>

## Local development

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Run all repository checks with:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Updating results

Replace `data/bcp-link-results.csv` with the new export while preserving the two header rows and the
existing metric column names. The build imports this file directly, so a new commit and deployment
are required before updated data appears on the hosted site.

## GitHub Pages deployment

The site is deployed by [the Pages workflow](.github/workflows/deploy-pages.yml). Every push to
`main` runs the unit tests, creates the production build, and publishes `dist/` to GitHub Pages.
The workflow can also be started manually from the repository's Actions tab.

Vite's base path is `/bcp-link-leaderboard/`, matching this project repository's GitHub Pages URL.
