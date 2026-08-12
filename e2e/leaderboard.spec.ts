import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import Papa from "papaparse";

async function openPrimaryNavigationIfNeeded(page: Page) {
  const trigger = page.getByRole("button", { name: /Open navigation|打开导航/ });
  if (await trigger.isVisible()) await trigger.click();
}

async function clickAtCurrentPosition(page: Page, locator: Locator, useTouch: boolean) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  if (useTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

test("renders real leaderboard data without page-level overflow", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "BCP-Link", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.locator(".intro-body p > strong").first()).toHaveText("BCP-Link");
  await expect(page.getByRole("button", { name: "Code on GitHub, coming soon" })).toBeDisabled();
  const browseCompPlusPaper = page.getByRole("link", { name: "BrowseComp-Plus", exact: true });
  await expect(browseCompPlusPaper).toHaveAttribute(
    "href",
    "https://arxiv.org/pdf/2508.06600",
  );
  await expect(browseCompPlusPaper).toHaveAttribute("target", "_blank");
  await expect(browseCompPlusPaper).toHaveAttribute("rel", "noreferrer");
  await expect(page.getByRole("button", { name: "Dataset, coming soon" })).toBeDisabled();
  await expect(page.getByText("Tevatron/browsecomp-plus-corpus")).toHaveCount(0);
  await expect(page.getByTestId("model-name")).toHaveCount(15);
  await expect(page.getByTestId("model-name").filter({ hasText: "WebSailor-32B" })).toHaveCount(1);
  await expect(page.getByTestId("model-name").filter({ hasText: "Deepseek-v4-pro" })).toHaveCount(1);
  await expect(page.getByText("4 models with comparable Accuracy data")).toBeVisible();
  const comparisonInsights = page.getByRole("list", {
    name: "Key findings from the BCP and BCP-Link comparison",
  });
  await expect(comparisonInsights.locator("li")).toHaveCount(2);
  await expect(comparisonInsights).toContainText(
    "BCP-Link achieves higher Accuracy than BCP with fewer agent turns",
  );
  await expect(comparisonInsights).toContainText(
    "the overall performance difference between BCP and BCP-Link is limited",
  );
  await expect(
    page.getByRole("heading", { name: "One fixed process, two standard tools" }),
  ).toBeVisible();
  await expect(page.locator(".rule-principles article")).toHaveCount(3);
  await expect(page.locator(".rule-principles h3")).toHaveText([
    "Reproducible by design",
    "Link-aware navigation",
    "Two standard tools",
  ]);
  await expect(page.locator(".evaluation-flow li")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Search", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visit", exact: true })).toBeVisible();
  await expect(page.getByText(/Top 5 · highlight enabled · up to 5 fragments/)).toBeVisible();
  await expect(page.locator(".rank-medal")).toHaveCount(3);
  await expect(page.locator(".percentage-data-bar")).toHaveCount(30);
  await expect(page.locator("thead th")).toHaveText([
    "Rank",
    "Model",
    "Accuracy",
    "Recall",
    "Search Calls",
    "Visit Calls",
    "Link-following Visit Calls",
    "Turns",
  ]);
  await expect(page.locator("thead .metric-group")).toHaveCount(0);
  await expect(page.locator(".metric-card")).toHaveCount(6);
  await expect(page.locator(".metric-card-category")).toHaveText([
    "Answer quality",
    "Answer quality",
    "Tool behavior",
    "Tool behavior",
    "Tool behavior",
    "Link following",
  ]);
  await expect(page.getByRole("link", { name: "View rankings" })).toHaveAttribute(
    "href",
    "#leaderboard",
  );
  await expect(page.getByRole("link", { name: "Review protocol" })).toHaveAttribute(
    "href",
    "#rules",
  );
  const downloadCsv = page.getByRole("link", { name: "Download leaderboard results as CSV" });
  await expect(downloadCsv).toHaveAttribute("download", "bcp-link-results.csv");
  await expect(page.getByRole("link", { name: "Back to top" })).toHaveAttribute("href", "#top");

  const tableShell = page.locator(".table-shell");
  const tableScroll = page.locator(".table-scroll");
  await expect(tableShell).toHaveAttribute("data-scrollable", "true");
  await expect(tableShell).toHaveAttribute("data-at-bottom", "false");
  await expect
    .poll(() => tableShell.evaluate((element) => getComputedStyle(element, "::after").opacity))
    .toBe("1");
  await tableScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(tableShell).toHaveAttribute("data-at-bottom", "true");
  await expect
    .poll(() => tableShell.evaluate((element) => getComputedStyle(element, "::after").opacity))
    .toBe("0");
  await tableScroll.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(tableShell).toHaveAttribute("data-at-bottom", "false");
  const comparisonChart = page.getByTestId("comparison-chart");
  await expect(comparisonChart).toHaveCount(1);
  const modelTrigger = page.getByRole("button", { name: "Choose comparison models" });
  await expect(modelTrigger).toHaveText("4 models selected");
  await modelTrigger.click();
  const modelMenuBox = await page
    .getByRole("group", { name: "Choose comparison models" })
    .boundingBox();
  expect(modelMenuBox).not.toBeNull();
  expect(modelMenuBox!.y + modelMenuBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height + 1,
  );
  for (const model of [
    "Qwen3.6-27B",
    "Tongyi-DeepResearch-30B-A3B",
    "Qwen3.6-35B-A3B",
    "Gemma-4-31B-it",
    "Qwen3.5-9B",
    "WebExplorer-8B",
    "SearchAgent-Zero",
    "WebSailor-32B",
    "Gemma-4-E4B-it",
    "DR-Venus-4B-RL",
    "AgentCPM-Explore",
    "MiroThinker-1.7-mini",
    "deepseek-v4-pro",
    "qwen3.7-plus",
    "glm-5.2",
  ]) {
    await expect(page.getByRole("checkbox", { name: model })).toBeVisible();
  }
  for (const model of [
    "Tongyi-DeepResearch-30B-A3B",
    "SearchAgent-Zero",
    "WebExplorer-8B",
    "WebSailor-32B",
  ]) {
    await expect(page.getByRole("checkbox", { name: model })).toBeChecked();
  }
  const additionalModel = page.getByRole("checkbox", { name: "Qwen3.6-27B" });
  await additionalModel.check();
  await expect(modelTrigger).toHaveText("5 models selected");
  await expect(comparisonChart.locator(".recharts-bar-rectangle")).toHaveCount(10);
  await additionalModel.uncheck();
  await expect(modelTrigger).toHaveText("4 models selected");
  await expect(comparisonChart.locator(".recharts-bar-rectangle")).toHaveCount(8);
  await page.keyboard.press("Escape");

  const visualDetails = await page.evaluate(() => {
    const workspace = document.querySelector(".comparison-workspace")!.getBoundingClientRect();
    const legend = document.querySelector(".comparison-series-legend")!.getBoundingClientRect();
    const getFontSize = (selector: string) =>
      getComputedStyle(document.querySelector(selector)!).fontSize;
    const valueCells = [
      "accuracy",
      "recall",
      "searchCalls",
      "visitCalls",
      "turns",
      "linkFollowingVisitCalls",
    ].map((key) => getComputedStyle(document.querySelector(`.metric-value-${key}`)!).textAlign);
    const searchWidth = document
      .querySelector(".metric-column-searchCalls")!
      .getBoundingClientRect().width;
    const visitWidth = document
      .querySelector(".metric-column-visitCalls")!
      .getBoundingClientRect().width;
    const modelWidth = document.querySelector(".model-column")!.getBoundingClientRect().width;
    const accuracyWidth = document
      .querySelector(".metric-column-accuracy")!
      .getBoundingClientRect().width;
    const linkWidth = document
      .querySelector(".metric-column-linkFollowingVisitCalls")!
      .getBoundingClientRect().width;
    return {
      legendInset: legend.left - workspace.left,
      controlLabelFont: getFontSize(".comparison-control-label"),
      modelValueFont: getFontSize(".comparison-model-trigger"),
      metricValueFont: getFontSize(".select-wrap select"),
      axisFont: getFontSize(".comparison-axis-label text"),
      sectionHeadingFont: getFontSize(".section-heading h2"),
      sectionNoteFont: getFontSize(".section-note"),
      searchFont: getFontSize(".search-field input"),
      introSubtitleFont: getFontSize(".intro-subtitle"),
      introBodyFont: getFontSize(".intro-body p"),
      introActionFont: getFontSize(".intro-action"),
      tableValueFont: getFontSize("tbody .metric-value-cell"),
      tableModelFont: getFontSize("tbody .model-name"),
      tableHeaderFont: getFontSize("thead .metric-label-row > th"),
      tableRowHeight: document.querySelector("tbody tr")!.getBoundingClientRect().height,
      tableTransform: getComputedStyle(document.querySelector(".table-shell")!).transform,
      tableBackground: getComputedStyle(document.querySelector(".table-shell")!).backgroundColor,
      tableMask: getComputedStyle(document.querySelector(".table-shell")!).maskImage,
      fadeBackground: getComputedStyle(document.querySelector(".table-shell")!, "::after")
        .backgroundImage,
      fadeBlur: getComputedStyle(document.querySelector(".table-shell")!, "::after")
        .backdropFilter,
      modelColumnShadow: getComputedStyle(document.querySelector("tbody .model-column")!).boxShadow,
      searchColumnBorderLeft: getComputedStyle(
        document.querySelector(".metric-column-searchCalls")!,
      ).borderLeftWidth,
      downloadBorder: getComputedStyle(document.querySelector(".download-csv")!).borderTopWidth,
      downloadBackground: getComputedStyle(document.querySelector(".download-csv")!).backgroundColor,
      insightFont: getFontSize(".comparison-insights p"),
      insightBorder: getComputedStyle(document.querySelector(".comparison-insights")!).borderWidth,
      insightBackground: getComputedStyle(document.querySelector(".comparison-insights")!)
        .backgroundColor,
      insightFollowsChart:
        document.querySelector(".comparison-workspace")!.nextElementSibling ===
        document.querySelector(".comparison-insights"),
      insightStrongText: Array.from(
        document.querySelectorAll(".comparison-insights strong"),
        (element) => element.textContent,
      ),
      principleBodyFont: getFontSize(".rule-principles p"),
      metricSummaryFont: getFontSize(".metric-card-summary"),
      valueCells,
      searchWidth,
      visitWidth,
      modelWidth,
      modelWidthToken: getComputedStyle(document.documentElement)
        .getPropertyValue("--model-width")
        .trim(),
      rankHeaderTextAlign: getComputedStyle(document.querySelector("thead .rank-column")!).textAlign,
      modelHeaderTextAlign: getComputedStyle(document.querySelector("thead .model-column")!).textAlign,
      metricHeaderAlignment: Array.from(document.querySelectorAll(".metric-header"), (header) =>
        getComputedStyle(header).justifyContent,
      ),
      metricSortAlignment: Array.from(document.querySelectorAll(".sort-button"), (button) =>
        getComputedStyle(button).justifyContent,
      ),
      metricLabelTextAlignment: Array.from(
        document.querySelectorAll(".sort-button span"),
        (label) => getComputedStyle(label).textAlign,
      ),
      firstRowBackground: getComputedStyle(document.querySelector("tbody tr:nth-child(1) > :last-child")!)
        .backgroundColor,
      secondRowBackground: getComputedStyle(document.querySelector("tbody tr:nth-child(2) > :last-child")!)
        .backgroundColor,
      accuracyWidth,
      linkWidth,
      searchHeaderWhiteSpace: getComputedStyle(
        document.querySelector(".metric-column-searchCalls .sort-button span")!,
      ).whiteSpace,
      visitHeaderWhiteSpace: getComputedStyle(
        document.querySelector(".metric-column-visitCalls .sort-button span")!,
      ).whiteSpace,
      ambientPosition: getComputedStyle(document.body, "::before").position,
      ambientAnimation: getComputedStyle(document.body, "::before").animationName,
      ambientAnimationDuration: getComputedStyle(document.body, "::before").animationDuration,
      ambientBackgroundSize: getComputedStyle(document.body, "::before").backgroundSize,
      workspaceOverflow: getComputedStyle(document.querySelector(".comparison-workspace")!).overflow,
      chartOverflowY: getComputedStyle(document.querySelector(".chart-scroll")!).overflowY,
      flowTransitionDuration: getComputedStyle(
        document.querySelector(".evaluation-flow-scroll")!,
      ).transitionDuration,
      flowArrowWidth: getComputedStyle(document.querySelector(".evaluation-flow")!, "::after")
        .borderLeftWidth,
      flowLineTop: getComputedStyle(document.querySelector(".evaluation-flow")!, "::before").top,
      flowArrowTop: getComputedStyle(document.querySelector(".evaluation-flow")!, "::after").top,
      principleParentBorder: getComputedStyle(document.querySelector(".rule-principles")!).borderWidth,
      principleCardBorder: getComputedStyle(document.querySelector(".rule-principles article")!)
        .borderWidth,
      toolSpecsPaddingBottom: getComputedStyle(document.querySelector(".tool-specs")!).paddingBottom,
      metricGridColumns: getComputedStyle(document.querySelector(".metric-guide-grid")!)
        .gridTemplateColumns.split(" ").length,
      metricCardHeight: document
        .querySelector(".metric-card-trigger")!
        .getBoundingClientRect().height,
      metricNameFont: getFontSize(".metric-card-copy strong"),
      metricSummaryDisplay: getComputedStyle(
        document.querySelector(".metric-card-summary")!,
      ).display,
      languageCodeDisplay: getComputedStyle(document.querySelector(".language-code")!).display,
      languageNameDisplay: getComputedStyle(document.querySelector(".language-name")!).display,
      metricCategoryColors: ["answerQuality", "toolBehavior", "linkFollowing"].map(
        (category) =>
          getComputedStyle(document.querySelector(`.metric-card-category-${category}`)!).color,
      ),
    };
  });
  expect(visualDetails.legendInset).toBeGreaterThanOrEqual(
    testInfo.project.name.startsWith("mobile") ? 16 : 38,
  );
  expect(visualDetails.controlLabelFont).toBe(visualDetails.modelValueFont);
  expect(visualDetails.controlLabelFont).toBe(visualDetails.metricValueFont);
  expect(Number.parseFloat(visualDetails.axisFont)).toBeGreaterThanOrEqual(15);
  expect(visualDetails.sectionHeadingFont).toBe(
    testInfo.project.name.startsWith("mobile") ? "29px" : "36px",
  );
  expect(visualDetails.sectionNoteFont).toBe(
    testInfo.project.name.startsWith("mobile") ? "15px" : "16px",
  );
  expect(visualDetails.searchFont).toBe("13px");
  expect(visualDetails.introSubtitleFont).toBe(
    testInfo.project.name.startsWith("mobile") ? "17px" : "21px",
  );
  expect(visualDetails.introBodyFont).toBe(
    testInfo.project.name.startsWith("mobile") ? "16px" : "17px",
  );
  expect(visualDetails.introActionFont).toBe("14px");
  expect(visualDetails.tableValueFont).toBe("16px");
  expect(visualDetails.tableModelFont).toBe("17px");
  expect(visualDetails.tableHeaderFont).toBe("17px");
  expect(visualDetails.tableRowHeight).toBeGreaterThanOrEqual(70);
  expect(visualDetails.tableTransform).toBe("none");
  expect(visualDetails.tableBackground).not.toBe("rgb(255, 255, 255)");
  expect(visualDetails.tableMask).not.toBe("none");
  expect(visualDetails.fadeBackground).toBe("none");
  expect(visualDetails.fadeBlur).toBe("blur(2px)");
  expect(visualDetails.modelColumnShadow).toBe("none");
  expect(visualDetails.searchColumnBorderLeft).toBe("0px");
  expect(visualDetails.downloadBorder).toBe("0px");
  expect(visualDetails.downloadBackground).toBe("rgba(0, 0, 0, 0)");
  expect(visualDetails.insightFont).toBe(
    testInfo.project.name.startsWith("mobile") ? "17px" : "18px",
  );
  expect(visualDetails.insightBorder).toBe("0px");
  expect(visualDetails.insightBackground).toBe("rgba(0, 0, 0, 0)");
  expect(visualDetails.insightFollowsChart).toBe(true);
  expect(visualDetails.insightStrongText).toEqual(["higher Accuracy"]);
  expect(Number.parseFloat(visualDetails.principleBodyFont)).toBeGreaterThanOrEqual(15);
  expect(Number.parseFloat(visualDetails.metricSummaryFont)).toBeGreaterThanOrEqual(15);
  expect(visualDetails.valueCells).toEqual(Array(6).fill("left"));
  expect(visualDetails.searchWidth).toBeGreaterThanOrEqual(visualDetails.accuracyWidth);
  expect(visualDetails.visitWidth).toBeGreaterThanOrEqual(visualDetails.accuracyWidth);
  expect(visualDetails.modelWidthToken).toBe(testInfo.project.name.startsWith("mobile") ? "210px" : "235px");
  expect(visualDetails.modelWidth).toBeLessThan(270);
  expect(visualDetails.rankHeaderTextAlign).toBe("center");
  expect(visualDetails.modelHeaderTextAlign).toBe("left");
  expect(visualDetails.metricHeaderAlignment).toEqual(Array(6).fill("flex-start"));
  expect(visualDetails.metricSortAlignment).toEqual(Array(6).fill("flex-start"));
  expect(visualDetails.metricLabelTextAlignment).toEqual(Array(6).fill("left"));
  expect(visualDetails.firstRowBackground).toBe(visualDetails.secondRowBackground);
  expect(visualDetails.searchHeaderWhiteSpace).toBe("nowrap");
  expect(visualDetails.visitHeaderWhiteSpace).toBe("nowrap");
  expect(visualDetails.linkWidth).toBeGreaterThan(visualDetails.accuracyWidth);
  expect(visualDetails.linkWidth).toBeLessThanOrEqual(225);
  expect(visualDetails.ambientPosition).toBe("fixed");
  expect(visualDetails.ambientAnimation).toBe("ambient-gradient-drift");
  expect(visualDetails.ambientAnimationDuration).toBe("18s");
  expect(visualDetails.ambientBackgroundSize).toBe("400% 400%");
  expect(visualDetails.workspaceOverflow).toBe("visible");
  expect(visualDetails.chartOverflowY).toBe("hidden");
  expect(visualDetails.flowTransitionDuration).toBe("0s");
  expect(visualDetails.flowArrowWidth).toBe("8px");
  expect(visualDetails.flowLineTop).toBe("53px");
  expect(visualDetails.flowArrowTop).toBe("48px");
  expect(visualDetails.principleParentBorder).toBe("0px");
  expect(visualDetails.principleCardBorder).toBe("1px");
  expect(visualDetails.toolSpecsPaddingBottom).toBe("10px");
  expect(visualDetails.metricGridColumns).toBe(testInfo.project.name.startsWith("mobile") ? 1 : 3);
  expect(visualDetails.metricCardHeight).toBeGreaterThanOrEqual(
    testInfo.project.name.startsWith("mobile") ? 192 : 208,
  );
  expect(Number.parseFloat(visualDetails.metricNameFont)).toBeGreaterThanOrEqual(19);
  expect(visualDetails.metricSummaryDisplay).not.toBe("none");
  expect(visualDetails.languageCodeDisplay === "none").toBe(
    !testInfo.project.name.startsWith("mobile"),
  );
  expect(visualDetails.languageNameDisplay === "none").toBe(
    testInfo.project.name.startsWith("mobile"),
  );
  expect(new Set(visualDetails.metricCategoryColors).size).toBe(3);

  const ambientStartPosition = await page.evaluate(
    () => getComputedStyle(document.body, "::before").backgroundPosition,
  );
  await page.waitForTimeout(500);
  const ambientEndPosition = await page.evaluate(
    () => getComputedStyle(document.body, "::before").backgroundPosition,
  );
  expect(ambientEndPosition).not.toBe(ambientStartPosition);

  const bcpLinkBars = comparisonChart.locator(".recharts-rectangle.chart-series-bcp-link");
  const bcpBars = comparisonChart.locator(".recharts-rectangle.chart-series-bcp");
  await expect(bcpLinkBars).toHaveCount(4);
  await expect(bcpBars).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const bcpLinkBox = await bcpLinkBars.nth(index).boundingBox();
    const bcpBox = await bcpBars.nth(index).boundingBox();
    expect(bcpLinkBox).not.toBeNull();
    expect(bcpBox).not.toBeNull();
    expect(bcpLinkBox!.x).toBeLessThan(bcpBox!.x);
  }
  const accuracyTicks = await comparisonChart.locator(".recharts-yAxis text").allTextContents();
  expect(accuracyTicks).not.toContain("0.00%");

  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasPageOverflow).toBe(false);

  await page.screenshot({
    path: testInfo.outputPath("leaderboard-full.png"),
    fullPage: true,
  });

  const downloadEvent = page.waitForEvent("download");
  await downloadCsv.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("bcp-link-results.csv");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const downloadedCsv = await readFile(downloadPath!, "utf8");
  expect(downloadedCsv.charCodeAt(0)).toBe(0xfeff);
  const parsedDownload = Papa.parse<string[]>(downloadedCsv.replace(/^\uFEFF/, ""), {
    skipEmptyLines: true,
  });
  expect(parsedDownload.errors).toEqual([]);
  expect(parsedDownload.data[0]).toEqual([
    "Rank",
    "Model",
    "Accuracy",
    "Recall",
    "Search Calls",
    "Visit Calls",
    "Link-following Visit Calls",
    "Turns",
  ]);
  expect(parsedDownload.data).toHaveLength(16);
  expect(parsedDownload.data[1]).toEqual([
    "1",
    "deepseek-v4-pro",
    "74.94%",
    "73.38%",
    "29.09",
    "3.11",
    "0.0827",
    "23.61",
  ]);
  expect(parsedDownload.data.every((row) => row.length === 8)).toBe(true);
  expect(downloadedCsv).not.toContain("benchmark");
});

test("keeps compact navigation and menus inside narrow viewports", async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const menuTrigger = page.getByRole("button", { name: "Open navigation" });
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(primaryNavigation).toBeVisible();
    const navigationBox = await primaryNavigation.boundingBox();
    expect(navigationBox).not.toBeNull();
    expect(navigationBox!.x).toBeGreaterThanOrEqual(0);
    expect(navigationBox!.x + navigationBox!.width).toBeLessThanOrEqual(viewport.width);
    await page.keyboard.press("Escape");
    await expect(menuTrigger).toBeFocused();

    const themeTrigger = page.getByRole("button", { name: "Choose color theme" });
    await themeTrigger.click();
    const themeMenu = page.getByRole("menu", { name: "Color themes" });
    const themeBox = await themeMenu.boundingBox();
    expect(themeBox).not.toBeNull();
    expect(themeBox!.x).toBeGreaterThanOrEqual(0);
    expect(themeBox!.x + themeBox!.width).toBeLessThanOrEqual(viewport.width);
    await page.keyboard.press("Escape");

    const pageWidths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      tableClient: document.querySelector(".table-scroll")?.clientWidth ?? 0,
      tableScroll: document.querySelector(".table-scroll")?.scrollWidth ?? 0,
    }));
    expect(pageWidths.scroll).toBeLessThanOrEqual(pageWidths.client + 1);
    expect(pageWidths.tableScroll).toBeGreaterThan(pageWidths.tableClient);
  }
});

test("stops the ambient gradient when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const animationName = await page.evaluate(
    () => getComputedStyle(document.body, "::before").animationName,
  );
  expect(animationName).toBe("none");
});

test("supports search, sorting, metric selection, and chart tooltips", async ({ page }, testInfo) => {
  await page.goto("/");

  await openPrimaryNavigationIfNeeded(page);
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Evaluation Rules", exact: true })
    .click();
  await expect(page).toHaveURL(/#rules$/);
  await expect(page.getByText("Each run is capped at 50 agent turns.")).toBeVisible();

  await openPrimaryNavigationIfNeeded(page);
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Metric Guide", exact: true })
    .click();
  await expect(page).toHaveURL(/#metrics$/);
  const navigationBottom = await page.locator(".site-header").evaluate((element) =>
    element.getBoundingClientRect().bottom,
  );
  const metricSectionTop = await page.locator("#metrics").evaluate((element) =>
    element.getBoundingClientRect().top,
  );
  expect(metricSectionTop).toBeGreaterThanOrEqual(navigationBottom - 1);

  await page.getByRole("button", { name: "Sort by Recall" }).click();
  await expect(page.getByTestId("model-name").first()).toHaveText("Deepseek-v4-pro");

  await page.getByRole("searchbox", { name: "Search models" }).fill("WebExplorer");
  await expect(page.getByTestId("model-name")).toHaveCount(1);
  await expect(page.getByText("Showing 1 of 15 models")).toBeVisible();

  await page.getByRole("combobox", { name: "Comparison metric" }).selectOption("recall");
  await expect(page.getByText("4 models with comparable Recall data")).toBeVisible();
  const comparisonChart = page.getByTestId("comparison-chart");
  await comparisonChart.locator(".recharts-bar-rectangle").first().hover();
  await expect(comparisonChart.locator(".recharts-tooltip-wrapper")).toBeVisible();
  await expect(comparisonChart.locator(".comparison-tooltip")).toContainText("Difference");

  const metricCard = page.getByRole("button", { name: "View Accuracy details" });
  await metricCard.hover();
  await expect(page.getByRole("tooltip")).toContainText("Calculation or source");
  await metricCard.click();
  await expect(page.getByRole("region", { name: /Accuracy:/ })).toContainText("Pinned");
  await page.mouse.move(0, 0);
  await expect(page.getByRole("region", { name: /Accuracy:/ })).toBeVisible();
  await page.getByRole("heading", { name: "How the leaderboard is measured" }).click();
  await expect(page.getByRole("region", { name: /Accuracy:/ })).toHaveCount(0);

  await metricCard.click();
  await expect(page.getByRole("region", { name: /Accuracy:/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(metricCard).toBeFocused();

  const bottomMetricCard = page.getByRole("button", {
    name: "View Link-following Visit Calls details",
  });
  await bottomMetricCard.hover();
  const bottomMetricPopover = page.getByRole("tooltip");
  await expect(bottomMetricPopover).toBeVisible();
  const bottomCardBox = await bottomMetricCard.boundingBox();
  const bottomPopoverBox = await bottomMetricPopover.boundingBox();
  expect(bottomCardBox).not.toBeNull();
  expect(bottomPopoverBox).not.toBeNull();
  expect(bottomPopoverBox!.y + bottomPopoverBox!.height).toBeLessThanOrEqual(
    bottomCardBox!.y + 6,
  );
  await page.mouse.move(0, 0);
  await expect(bottomMetricPopover).not.toBeVisible();

  await expect(page.getByRole("button", { name: "Expand leaderboard" })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Expanded BCP-Link leaderboard" })).toHaveCount(0);

  const modelTrigger = page.getByRole("button", { name: "Choose comparison models" });
  await modelTrigger.click();
  const selectAllModels = page.getByRole("checkbox", { name: /Select all/ });
  await expect(selectAllModels).toHaveJSProperty("indeterminate", true);
  await selectAllModels.check();
  await expect(modelTrigger).toHaveText("15 models selected");
  await expect(page.getByText("12 models with comparable Recall data")).toBeVisible();
  await expect(comparisonChart.locator(".recharts-bar-rectangle")).toHaveCount(24);
  await selectAllModels.uncheck();
  await expect(modelTrigger).toHaveText("0 models selected");
  await expect(page.getByRole("status")).toContainText("No models selected");
  await expect(comparisonChart).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Tongyi-DeepResearch-30B-A3B" }).check();
  await expect(modelTrigger).toHaveText("1 model selected");
  await expect(page.getByText("1 model with comparable Recall data")).toBeVisible();
  await expect(comparisonChart.locator(".recharts-bar-rectangle")).toHaveCount(2);
  await page.getByRole("checkbox", { name: "SearchAgent-Zero" }).check();
  await expect(modelTrigger).toHaveText("2 models selected");
  await expect(comparisonChart.locator(".recharts-bar-rectangle")).toHaveCount(4);
  await modelTrigger.click();

  await page.getByRole("button", { name: "Choose color theme" }).click();
  await page.getByRole("menuitemradio", { name: "Teal Amber" }).click();
  await page.getByRole("button", { name: "使用中文" }).click();
  await openPrimaryNavigationIfNeeded(page);
  await expect(
    page
      .getByRole("navigation", { name: "主导航" })
      .getByRole("link", { name: "排行榜", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "搜索模型" })).toHaveValue("WebExplorer");
  await expect(page.getByRole("combobox", { name: "选择对比指标" })).toHaveValue("recall");
  await expect(page.getByRole("button", { name: "选择对比模型" })).toHaveText("已选择 2 个模型");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "teal-amber");
  await expect(page.locator("thead th").filter({ hasText: "Accuracy" })).toHaveCount(1);
  await expect(page.locator("thead th").filter({ hasText: "Link-following Visit Calls" })).toHaveCount(1);

  const hasChinesePageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasChinesePageOverflow).toBe(false);
  await page.getByRole("searchbox", { name: "搜索模型" }).fill("");
  await page.getByRole("combobox", { name: "选择对比指标" }).selectOption("accuracy");
  await page
    .getByRole("button", { name: "按 Accuracy 排序" })
    .evaluate((button: HTMLButtonElement) => button.click());
  await page.getByRole("link", { name: "返回 BCP-Link 首页" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({
    path: testInfo.outputPath("leaderboard-chinese.png"),
    fullPage: true,
  });
});

test("applies all five themes to the chart and captures each palette", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".recharts-bar-rectangle")).toHaveCount(8);

  const themeScrollPosition = await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    const comparison = document.querySelector("#comparison")!;
    window.scrollTo(0, comparison.getBoundingClientRect().top + window.scrollY);
    return window.scrollY;
  });
  const useTouch = testInfo.project.name.startsWith("mobile");
  await clickAtCurrentPosition(
    page,
    page.getByRole("button", { name: "Choose color theme" }),
    useTouch,
  );
  await expect
    .poll(() => page.evaluate((before) => Math.abs(window.scrollY - before), themeScrollPosition))
    .toBeLessThanOrEqual(1);
  await clickAtCurrentPosition(
    page,
    page.getByRole("menuitemradio", { name: "Daylight Green" }),
    useTouch,
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sage-gold");
  await expect
    .poll(() => page.evaluate((before) => Math.abs(window.scrollY - before), themeScrollPosition))
    .toBeLessThanOrEqual(1);
  await clickAtCurrentPosition(
    page,
    page.getByRole("button", { name: "Choose color theme" }),
    useTouch,
  );
  await clickAtCurrentPosition(
    page,
    page.getByRole("menuitemradio", { name: "Research Blue" }),
    useTouch,
  );
  await expect
    .poll(() => page.evaluate((before) => Math.abs(window.scrollY - before), themeScrollPosition))
    .toBeLessThanOrEqual(1);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.removeProperty("scroll-behavior");
  });

  const themes = [
    ["Research Blue", "research-blue"],
    ["Daylight Green", "sage-gold"],
    ["Teal Amber", "teal-amber"],
    ["Warm Neutral", "warm-neutral"],
    ["Charcoal Amber", "charcoal-amber"],
  ] as const;
  const ambientBackgrounds = new Set<string>();

  for (const [name, key] of themes) {
    if (key !== "research-blue") {
      await page.getByRole("button", { name: "Choose color theme" }).click();
      await page.getByRole("menuitemradio", { name }).click();
    }

    await expect(page.locator("html")).toHaveAttribute("data-theme", key);
    const colors = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement);
      const bcpBar = document.querySelector<SVGElement>(".chart-series-bcp .recharts-bar-rectangle");
      const bcpLinkBar = document.querySelector<SVGElement>(
        ".chart-series-bcp-link .recharts-bar-rectangle",
      );
      return {
        ambientBackground: getComputedStyle(document.body, "::before").backgroundImage,
        bcpToken: rootStyle.getPropertyValue("--chart-bcp").trim(),
        bcpLinkToken: rootStyle.getPropertyValue("--chart-bcp-link").trim(),
        bcpFill: bcpBar ? getComputedStyle(bcpBar).fill : "",
        bcpLinkFill: bcpLinkBar ? getComputedStyle(bcpLinkBar).fill : "",
      };
    });
    expect(colors.ambientBackground).not.toBe("none");
    expect(colors.ambientBackground).toContain("linear-gradient");
    ambientBackgrounds.add(colors.ambientBackground);
    expect(colors.bcpToken).not.toBe("");
    expect(colors.bcpLinkToken).not.toBe("");
    expect(colors.bcpToken).not.toBe(colors.bcpLinkToken);
    expect(colors.bcpFill).not.toBe("");
    expect(colors.bcpLinkFill).not.toBe("");
    expect(colors.bcpFill).not.toBe(colors.bcpLinkFill);

    await page.screenshot({ path: testInfo.outputPath(`${key}.png`), fullPage: true });
  }
  expect(ambientBackgrounds.size).toBe(themes.length);
});
