# BCP-Link Leaderboard

A bilingual static leaderboard for the BCP-Link research-agent benchmark. The site reads the
committed results CSV, presents the BCP-Link ranking, compares BCP with BCP-Link, and documents the
shared evaluation tools and metrics.

## Local development

Requirements: Node.js 18 or newer.

```bash
npm ci
npm run dev
```

The local Vite server does not run Cloudflare authentication. The authentication middleware is
executed only by Cloudflare Pages or a compatible local Pages runtime.

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

## Private GitHub repository

Create a private repository in a personal GitHub account or, preferably, the project's GitHub
organization. Commit this directory and push it to that repository. Team members do not need
repository access merely to use the deployed leaderboard.

Do not commit passwords, tokens, internal service URLs, or Cloudflare credentials.

## Cloudflare Pages deployment

1. In Cloudflare Pages, create a project and connect the private GitHub repository. Grant the
   Cloudflare GitHub App access only to this repository when possible.
2. Configure the production build:
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Node.js version: `20`
3. Add encrypted production environment variables:
   - `SITE_USERNAME`: the shared Basic Auth username
   - `SITE_PASSWORD`: a long, unique shared password using ASCII characters
4. Deploy. The root `functions/_middleware.ts` and `public/_routes.json` require authentication for
   every HTML, JavaScript, CSS, and asset request.

Missing credentials fail closed with HTTP 503. Incorrect or missing login details return HTTP 401
and trigger the browser's native username/password prompt. Rotate `SITE_PASSWORD` whenever team
membership changes or the password may have been shared outside the project.

## Making the site public later

Set the Cloudflare production environment variable `AUTH_DISABLED=true` and redeploy. The same
Pages project and custom domain become public without moving the repository or changing the site
URL. Remove `AUTH_DISABLED` to restore password protection.

The GitHub repository can remain private after the website becomes public. Publishing the source
repository is a separate decision.
