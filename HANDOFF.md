# BCP-Link Leaderboard Handoff

Last updated: 2026-08-15

## 1. Project Location And Current Status

- Project root: `/data/hs_dev/bcp-link-leaderboard`
- Stack: Vite, React 18, TypeScript, Recharts, Papa Parse, Vitest, Playwright
- Data source: `data/bcp-link-results.csv`
- Latest imported source: `/data/hs_dev/bcp-link测评结果汇总 - Sheet1.csv`; it now contains 9 fully comparable models, including WebSailor-32B.
- GitHub private repository: `https://github.com/Samanthe-H/bcp-link-leaderboard`.
- The local `main` branch tracks `origin/main` over SSH.
- Cloudflare Pages production site: `https://bcp-link-leaderboard.pages.dev/`.
- Current deployed UI source commit: `3101411`.
- Current immutable deployment: `https://086bc421.bcp-link-leaderboard.pages.dev/`.
- The current data, theme, introduction, leaderboard, and comparison-chart work is complete.
  TypeScript, production build, unit/component tests, end-to-end tests, and desktop/mobile visual
  checks pass.

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

- Replaced the old single language button in React with a two-option segmented control. Desktop
  shows only the full names (`English` and `中文`); viewports at 1080px and below show only the compact
  forms (`EN` and `中`).
- Both buttons expose `aria-pressed`; switching languages does not remount the table or chart.
- Chinese leaderboard fields and metric names are now English:
  - `Rank`, `Model`, `Accuracy`, `Recall`, `Search Calls`, `Visit Calls`, `Link-following Visit Calls`, `Turns`.
- Chinese sorting labels now use forms such as `按 Accuracy 排序`.
- The full `Link-following Visit Calls` name is used instead of the prior `Link Visits` abbreviation.

### Page Structure And Content

- The About section uses `About BCP-Link` as its heading and presents the benchmark definition in one
  framed description panel in both languages. The copy identifies the offline, fully reproducible
  environment and reports 100,195 fixed webpages plus 63,371 verified links. A release list records
  the corpus size, link coverage, document views, standardized tools, and eight Parquet shards.
- The About resource actions now link to the SearcherKit evaluation code on GitHub and the released
  BCP-Link corpus on Hugging Face. The BrowseComp-Plus paper remains linked from the benchmark
  description. No unreleased QA or relevance-judgment data is claimed as part of the corpus release.
- The rendered section order is now:
  1. About BCP-Link
  2. Leaderboard
  3. BCP vs. BCP-Link comparison
  4. Evaluation Rules
  5. Metric Guide
- Added stable section IDs: `about`, `leaderboard`, `comparison`, `rules`, and `metrics`.
- Removed the duplicated `What is recorded` / `记录哪些结果` block from Evaluation Rules.
- Kept the 50-turn limit directly below the tool panels.
- Evaluation Rules renders the three benchmark principles as separate framed cards, shows a six-step
  Query → Search → Visit → second-hop Visit → Evidence → Answer path with a directional arrow, and
  uses simplified Search and Visit headings above the detailed tool contracts. The path line and
  arrow were moved upward by 8px so the line aligns with the flow-node centers without crowding the
  step labels.
- Metric Guide uses a flat six-card grid instead of category columns: three cards per row on desktop,
  two on tablet, and one on mobile. Its taller cards show the unit, category, enlarged metric name,
  and concise definition directly on the surface. Each card carries its Answer quality, Tool behavior,
  or Link following category in the upper-right badge. Answer quality uses the theme primary color,
  Tool behavior uses the dark chart-support color, and Link following uses the accent color. Hover
  or keyboard focus previews a floating detail panel; clicking pins
  selectable detail text. Clicking inside the detail panel keeps it pinned; clicking anywhere else,
  clicking the trigger again, or pressing Escape clears it. Detail panels open downward for the first
  card row and upward for the second row so the lower cards are not obscured by the footer or viewport
  edge.

### Chart Logic

- The comparison section offers every leaderboard model through a multi-select model picker. It
  initially selects Tongyi-DeepResearch-30B-A3B, SearchAgent-Zero, WebExplorer-8B, and WebSailor-32B;
  a select-all checkbox can select every model or clear the selection.
- Picker options follow the leaderboard Accuracy order and update automatically from the parsed CSV.
- Selected models are rendered together in one grouped chart with BCP-Link as the left bar and BCP as
  the right bar; the metric selector applies to all selected models.
- The shared chart uses a focused padded Y-axis domain; it starts at zero only when one compared value
  is zero.
- Multiple models share one chart. The chart uses internal horizontal scrolling when its stable
  minimum width exceeds the viewport, without causing page-level overflow.
- The comparison workspace allows the model menu to escape the chart clipping boundary; the menu
  uses a viewport-relative maximum height and remains inside desktop and mobile viewports.
- Chart grid, axes, tooltip, cursor, BCP bars, and BCP-Link bars reference semantic CSS variables.
- Intended series variables are `--chart-bcp` and `--chart-bcp-link`.

## 4. Current UI Completion

The current UI upgrade is complete.

- `src/styles.css` defines semantic tokens and five `data-theme` palettes for the complete dashboard.
- Rose Sage was removed. The former Sage Gold option is now Daylight Green, based on the supplied
  daytime reference; its persisted key remains `sage-gold` for compatibility.
- Every theme supplies a visibly differentiated four-color diagonal field through `--ambient-bg`.
  The fixed viewport background enlarges that field to 400% and moves it from side to side during
  an 18-second cycle; only the color field moves, and `prefers-reduced-motion` disables the animation.
- The Research Blue ambient gradient uses a softened warm-color transition so the yellow region does
  not overpower the page. The navigation uses the transparent dark-background brand icon from
  `src/assets/bcp-link-logo-dark.svg`, cropped to the 42px brand mark without a background tile.
- The introduction includes compact links to the rankings and evaluation protocol. The leaderboard
  keeps search and internal table scrolling without a separate expanded dialog. Its Model column is
  narrower on desktop, Search Calls and Visit Calls stay on one line, and the long Link-following
  Visit Calls column uses a 190px width token and wraps its header instead of leaving excess empty
  space. All metric headers, including wrapped label text, and all metric values are left-aligned;
  Rank stays centered and Model stays left-aligned. The footer includes a right-aligned Back to top
  action.
- The sticky header, theme picker, palette swatches, segmented language control, focus/hover states,
  and 320px+ responsive layouts are styled. Theme selection restores focus without changing the
  current page scroll position.
- Hard-coded interface colors were replaced with semantic variables; obsolete language-toggle and scoring-block rules were removed.
- Recharts series have stable classes so CSS variables resolve correctly in SVG, BCP-Link remains
  left of BCP within every model group, and tests verify the rendered SVG positions.
- Metric values use fixed per-column precision: two decimals for Accuracy, Recall, Search Calls,
  Visit Calls, and Turns; four decimals for Link-following Visit Calls.
- Component tests cover all themes, persistence, picker dismissal, exact section order, fixed metric
  precision, the all-model comparison picker, select-all/clear behavior, Chinese UI with English
  metrics, state preservation, leaderboard search, and Metric Guide preview, pinning, inside-click,
  outside-click, and Escape behavior.
- Playwright covers both desktop and Pixel 7 viewports, page overflow, one/multiple comparison-model
  selection, shared-chart bar counts, BCP-Link/BCP geometry, tooltip behavior, theme-driven chart
  fills, all six metric header/value alignments, lower-card popover placement, outside-click dismissal,
  and all five palette screenshots.
- Visual checks cover the single-column benchmark introduction, shared comparison chart, desktop and
  mobile layouts, model-menu containment, and internal chart scrolling.
- The release README files also document the reproducible document-graph framing:
  `/data/hs_dev/SearcherKit-BCP-Link-Eval-Release/README.md` and
  `/data/hs_dev/BCP-Link-Release/README.md`.

## 5. Screenshot Artifacts

- Desktop/mobile full pages: the `test-results/leaderboard-renders-real-.../` Playwright result
  directories.
- Theme captures: the `test-results/leaderboard-applies-all-.../` Playwright result directories.
- Chinese desktop/mobile states: the `test-results/leaderboard-supports-search-.../` Playwright result
  directories.
- These ignored artifacts are regenerated by `npm run test:e2e`; directory suffixes can change with
  Playwright test-title hashing.

## 6. Verification At Handoff

Commands run from `/data/hs_dev/bcp-link-leaderboard`:

```text
npm run typecheck  PASS
npm run build      PASS
npm test           PASS: 27 passed
npm run test:e2e   PASS: 10 passed across desktop and mobile Chromium
```

Deployment verification completed on 2026-08-15:

```text
GitHub repository visibility  PRIVATE
GitHub default branch         main
Deployed source commit        3101411
Immutable deployment          https://086bc421.bcp-link-leaderboard.pages.dev/
Production unauthenticated    HTTP 401
Immutable unauthenticated     HTTP 401
Authenticated access          HTTP 200 (previously verified; secrets unchanged)
Production HTML               current BCP-Link dashboard assets loaded
Production data               9 models; WebSailor-32B included
Comparison picker             9 models available; 4 selected by default; select-all/clear supported
Comparison rendering          0/1/2/5/9 selected models render 0/2/4/10/18 bars
```

## 7. Current Deployment

- GitHub repository: `https://github.com/Samanthe-H/bcp-link-leaderboard`
- Cloudflare Pages project: `bcp-link-leaderboard`
- Production branch: `main`
- Production URL: `https://bcp-link-leaderboard.pages.dev/`
- Current deployed UI source commit: `3101411`
- Current immutable deployment URL: `https://086bc421.bcp-link-leaderboard.pages.dev/`
- GitHub stores the private source and version history; the live site is hosted by Cloudflare Pages,
  not GitHub Pages.
- Production deployments are direct uploads from the current `main` build. Use
  `npx wrangler@3.114.17 pages deployment list --project-name bcp-link-leaderboard` to inspect the
  latest source commit and immutable deployment URL without relying on stale handoff metadata.
- The initial production release was deployed with Wrangler direct upload from `dist`; the root
  `functions/` middleware and `_routes.json` were included.
- `SITE_USERNAME` and `SITE_PASSWORD` are encrypted Cloudflare production secrets. Their values are
  intentionally not stored in this repository or this handoff document.
- Future result changes require `npm run build`, a Git push, and a new Pages deployment unless a
  GitHub-based automatic deployment is configured later.

## 8. Palette References

- UI reference: `/root/.codex/attachments/fa42566f-368d-4650-abd5-4d78fe8e151b/codex-clipboard-627fae6b-61d9-4df2-bbd2-ef6aaf24e2d9.png`
- Research Blue: `/root/.codex/attachments/4045c21f-5490-42f3-8bba-f8fbd3f18eae/Color Hunt Palette f9f7f7dbe2ef3f72af112d4e.png`
- Daylight Green: `/data/hs_dev/BCP-Link-Leaderboard_Offline_v2.html` paper/daytime mode
- Teal Amber: `/root/.codex/attachments/8927a77a-104a-49ef-ab27-e3c12834a955/Color Hunt Palette 224248325e6a44a1a4ff9a00.png`
- Warm Neutral: `/root/.codex/attachments/9a0d6a14-c1af-4eb4-ac20-8059ffde195b/Color Hunt Palette f9f8f6efe9e3d9cfc7c9b59c.png`
- Charcoal Amber: `/root/.codex/attachments/e2c42329-761a-4ab4-9d9a-990a9de28432/Color Hunt Palette 222831393e46ffd369eeeeee.png`

## 9. Constraints To Preserve

- Research Blue remains the first-visit default.
- BCP-Link remains the left/brighter series; BCP remains the right/darker or quieter series.
- Language and theme switching must preserve search, sorting, comparison metric, and selected-model
  state.
- The comparison picker must expose every parsed leaderboard model, support selecting or clearing
  all models, and render all selected models in one chart.
- Chinese explanatory prose remains Chinese, while leaderboard columns and metric names remain English.
- Existing CSV parsing, ranking behavior, Cloudflare Basic Auth, and private deployment behavior should not change.
