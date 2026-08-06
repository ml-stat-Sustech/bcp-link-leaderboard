# BCP-Link Leaderboard Handoff

Last updated: 2026-08-06

## 1. Project Location And Current Status

- Project root: `/data/hs_dev/bcp-link-leaderboard`
- Stack: Vite, React 18, TypeScript, Recharts, Papa Parse, Vitest, Playwright
- Data source: `data/bcp-link-results.csv`
- Latest imported source: `/data/hs_dev/bcp-link测评结果汇总 - Sheet1.csv`; it now contains 9 fully comparable models, including WebSailor-32B.
- GitHub private repository: `https://github.com/Samanthe-H/bcp-link-leaderboard`.
- The local `main` branch tracks `origin/main` over SSH.
- Cloudflare Pages production site: `https://bcp-link-leaderboard.pages.dev/`.
- The latest theme/layout upgrade is complete. TypeScript, production build, unit tests, end-to-end tests, and desktop/mobile visual checks pass.

## 2. Features Completed Before The Latest Upgrade

- BCP-Link leaderboard table with Accuracy ranking, search, sortable metric columns, missing-value handling, sticky headers, and horizontal scrolling.
- BCP versus BCP-Link comparison chart with selectable metrics, tooltips, responsive width, and empty states.
- English and Chinese translations with browser-language detection and `localStorage` persistence.
- About BCP-Link, Evaluation Rules, `search(query)`, `visit(document_id, goal)`, and Metric Guide content.
- CSV parsing for BOM, two-row headers, inherited model names, percentage conversion, null values, and BCP/BCP-Link pairing.
- Cloudflare Pages Basic Auth middleware, `_routes.json`, private deployment instructions, and public-mode switch.
- Before the latest upgrade, unit/component/Auth tests and Playwright tests were passing.

## 3. Latest Upgrade Work Already Implemented

### Theme Logic

- Added `src/themes.ts` with:
  - `ThemeKey` covering all five themes.
  - Theme names in English and Chinese.
  - The four source colors for every supplied palette.
  - `DEFAULT_THEME = "research-blue"`.
  - `THEME_STORAGE_KEY = "bcp-link-theme"`.
  - Validation and restoration of the saved theme.
- `LeaderboardApp` now stores the selected theme in `localStorage` and sets `data-theme` on `<html>`.
- Added a theme picker with a palette button, current swatches, five menu options, selected-state checkmark, outside-click closing, Escape closing, and focus restoration.

### Language And Copy

- Replaced the old single language button in React with a two-option segmented control:
  - `EN English`
  - `中 中文`
- Both buttons expose `aria-pressed`; switching languages does not remount the table or chart.
- Chinese leaderboard fields and metric names are now English:
  - `Rank`, `Model`, `Accuracy`, `Recall`, `Search Calls`, `Visit Calls`, `Link-following Visit Calls`, `Turns`.
- Chinese sorting labels now use forms such as `按 Accuracy 排序`.
- The full `Link-following Visit Calls` name is used instead of the prior `Link Visits` abbreviation.

### Page Structure And Content

- The About section uses `BCP-Link` as its heading, a one-line English benchmark subtitle, and one
  framed single-column description panel in both languages.
- The rendered section order is now:
  1. About BCP-Link
  2. Leaderboard
  3. BCP vs. BCP-Link comparison
  4. Evaluation Rules
  5. Metric Guide
- Added stable section IDs: `about`, `leaderboard`, `comparison`, `rules`, and `metrics`.
- Removed the duplicated `What is recorded` / `记录哪些结果` block from Evaluation Rules.
- Kept the 50-turn limit directly below the tool panels.
- Added a bilingual Metric Guide sentence that maps metrics to Answer quality, Tool behavior, and Link following.

### Chart Logic

- The comparison section is limited to Tongyi-DeepResearch-30B-A3B, SearchAgent-Zero,
  WebExplorer-8B, and WebSailor-32B.
- Each model has a separate two-bar chart while all four charts share one metric selector; BCP-Link
  is the left bar and BCP is the right bar.
- Each chart uses a focused padded Y-axis domain; it starts at zero only when one compared value is zero.
- Chart grid, axes, tooltip, cursor, BCP bars, and BCP-Link bars reference semantic CSS variables.
- Intended series variables are `--chart-bcp` and `--chart-bcp-link`.

## 4. Latest Upgrade Completion

The theme/layout upgrade is now complete.

- `src/styles.css` defines semantic tokens and five `data-theme` palettes for the complete dashboard.
- Rose Sage was removed. Sage Gold, Teal Amber, and Charcoal Amber now use their source gold/amber colors for the brand mark, active language state, callout rules, and BCP-Link series.
- The sticky header, theme picker, palette swatches, segmented language control, focus/hover states, and 320px+ responsive layouts are styled.
- Hard-coded interface colors were replaced with semantic variables; obsolete language-toggle and scoring-block rules were removed.
- Recharts series have stable classes and 28px bars so CSS variables resolve correctly in SVG and paired bars remain visually grouped.
- Metric values use fixed per-column precision: two decimals for Accuracy, Recall, Search Calls,
  Visit Calls, and Turns; four decimals for Link-following Visit Calls.
- Component tests cover all themes, persistence, picker dismissal, exact section order, removed copy, Chinese UI with English metrics, and state preservation.
- Playwright covers both desktop and Pixel 7 viewports, page overflow, paired-bar geometry, theme-driven chart fills, and all five palette screenshots.
- Visual checks also covered open theme-menu bounds at 1440px, 412px, and 320px widths.

## 5. Screenshot Artifacts

- Desktop themes: `test-results/leaderboard-applies-all-fi-a42c7-t-and-captures-each-palette-desktop-chromium/`
- Mobile themes: `test-results/leaderboard-applies-all-fi-a42c7-t-and-captures-each-palette-mobile-chromium/`
- Chinese desktop/mobile states: the `leaderboard-supports-search...` Playwright result directories.

## 6. Verification At Handoff

Commands run from `/data/hs_dev/bcp-link-leaderboard`:

```text
npm run typecheck  PASS
npm run build      PASS
npm test           PASS: 18 passed
npm run test:e2e   PASS: 6 passed across desktop and mobile Chromium
```

Deployment verification completed on 2026-08-05:

```text
GitHub repository visibility  PRIVATE
GitHub default branch         main
Cloudflare unauthenticated    HTTP 401
Cloudflare authenticated      HTTP 200
Production HTML               current BCP-Link dashboard assets loaded
Production data               9 models; WebSailor-32B included
```

## 7. Current Deployment

- GitHub repository: `https://github.com/Samanthe-H/bcp-link-leaderboard`
- Cloudflare Pages project: `bcp-link-leaderboard`
- Production branch: `main`
- Production URL: `https://bcp-link-leaderboard.pages.dev/`
- The initial production release was deployed with Wrangler direct upload from `dist`; the root
  `functions/` middleware and `_routes.json` were included.
- `SITE_USERNAME` and `SITE_PASSWORD` are encrypted Cloudflare production secrets. Their values are
  intentionally not stored in this repository or this handoff document.
- Future result changes require `npm run build`, a Git push, and a new Pages deployment unless a
  GitHub-based automatic deployment is configured later.

## 8. Palette References

- UI reference: `/root/.codex/attachments/fa42566f-368d-4650-abd5-4d78fe8e151b/codex-clipboard-627fae6b-61d9-4df2-bbd2-ef6aaf24e2d9.png`
- Research Blue: `/root/.codex/attachments/4045c21f-5490-42f3-8bba-f8fbd3f18eae/Color Hunt Palette f9f7f7dbe2ef3f72af112d4e.png`
- Sage Gold: `/root/.codex/attachments/d69f8080-3081-4bda-b374-0ae082aa5d8f/Color Hunt Palette 8fa28ac7d3c0f7f4edc8a96b.png`
- Teal Amber: `/root/.codex/attachments/8927a77a-104a-49ef-ab27-e3c12834a955/Color Hunt Palette 224248325e6a44a1a4ff9a00.png`
- Warm Neutral: `/root/.codex/attachments/9a0d6a14-c1af-4eb4-ac20-8059ffde195b/Color Hunt Palette f9f8f6efe9e3d9cfc7c9b59c.png`
- Charcoal Amber: `/root/.codex/attachments/e2c42329-761a-4ab4-9d9a-990a9de28432/Color Hunt Palette 222831393e46ffd369eeeeee.png`

## 9. Constraints To Preserve

- Research Blue remains the first-visit default.
- BCP-Link must use the brighter chart color; BCP uses the darker or quieter companion color.
- Language and theme switching must preserve search, sorting, and comparison metric state.
- Chinese explanatory prose remains Chinese, while leaderboard columns and metric names remain English.
- Existing CSV parsing, ranking behavior, Cloudflare Basic Auth, and private deployment behavior should not change.
