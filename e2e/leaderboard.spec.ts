import { expect, test } from "@playwright/test";

test("renders real leaderboard data without page-level overflow", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "BCP-Link Leaderboard", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByTestId("model-name")).toHaveCount(9);
  await expect(page.getByTestId("model-name").filter({ hasText: "WebSailor-32B" })).toHaveCount(1);
  await expect(page.getByText("4 models with comparable Accuracy data")).toBeVisible();
  await expect(page.getByRole("heading", { name: "One environment, the same tools" })).toBeVisible();
  await expect(page.getByText(/Top 5 · highlight enabled · up to 5 fragments/)).toBeVisible();
  const comparisonCharts = page.getByTestId("model-comparison-chart");
  await expect(comparisonCharts).toHaveCount(4);
  await expect(comparisonCharts.locator("h3")).toHaveText([
    "Tongyi-DeepResearch-30B-A3B",
    "SearchAgent-Zero",
    "WebExplorer-8B",
    "WebSailor-32B",
  ]);
  await expect(page.locator(".recharts-bar-rectangle")).toHaveCount(8);
  for (let index = 0; index < 4; index += 1) {
    await expect(comparisonCharts.nth(index).locator(".recharts-bar-rectangle")).toHaveCount(2);
  }
  const firstChart = comparisonCharts.first();
  const bcpLinkBox = await firstChart
    .locator(".recharts-rectangle.chart-series-bcp-link")
    .boundingBox();
  const bcpBox = await firstChart.locator(".recharts-rectangle.chart-series-bcp").boundingBox();
  expect(bcpLinkBox).not.toBeNull();
  expect(bcpBox).not.toBeNull();
  expect(bcpLinkBox!.x).toBeLessThan(bcpBox!.x);
  const accuracyTicks = await comparisonCharts.locator(".recharts-yAxis text").allTextContents();
  expect(accuracyTicks).not.toContain("0.00%");

  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasPageOverflow).toBe(false);

  await page.screenshot({
    path: testInfo.outputPath("leaderboard-full.png"),
    fullPage: true,
  });
});

test("supports search, sorting, metric selection, and chart tooltips", async ({ page }, testInfo) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Evaluation Rules" }).click();
  await expect(page).toHaveURL(/#rules$/);
  await expect(page.getByText("Each run is capped at 50 agent turns.")).toBeVisible();

  await page.getByRole("link", { name: "Metric Guide" }).click();
  await expect(page).toHaveURL(/#metrics$/);
  const navigationBottom = await page.locator(".site-header").evaluate((element) =>
    element.getBoundingClientRect().bottom,
  );
  const metricSectionTop = await page.locator("#metrics").evaluate((element) =>
    element.getBoundingClientRect().top,
  );
  expect(metricSectionTop).toBeGreaterThanOrEqual(navigationBottom - 1);

  await page.getByRole("button", { name: "Sort by Recall" }).click();
  await expect(page.getByTestId("model-name").first()).toHaveText("Qwen3.6-27B");

  await page.getByRole("searchbox", { name: "Search models" }).fill("WebExplorer");
  await expect(page.getByTestId("model-name")).toHaveCount(1);
  await expect(page.getByText("Showing 1 of 9 models")).toBeVisible();

  await page.getByRole("combobox", { name: "Comparison metric" }).selectOption("recall");
  await expect(page.getByText("4 models with comparable Recall data")).toBeVisible();
  const firstComparisonChart = page.getByTestId("model-comparison-chart").first();
  await firstComparisonChart.locator(".recharts-bar-rectangle").first().hover();
  await expect(firstComparisonChart.locator(".recharts-tooltip-wrapper")).toBeVisible();

  await page.getByRole("button", { name: "Choose color theme" }).click();
  await page.getByRole("menuitemradio", { name: "Teal Amber" }).click();
  await page.getByRole("button", { name: "使用中文" }).click();
  await expect(page.getByRole("link", { name: "排行榜" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "搜索模型" })).toHaveValue("WebExplorer");
  await expect(page.getByRole("combobox", { name: "选择对比指标" })).toHaveValue("recall");
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
  await page.getByRole("button", { name: "按 Accuracy 排序" }).click();
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

  const themes = [
    ["Research Blue", "research-blue"],
    ["Sage Gold", "sage-gold"],
    ["Teal Amber", "teal-amber"],
    ["Warm Neutral", "warm-neutral"],
    ["Charcoal Amber", "charcoal-amber"],
  ] as const;

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
        bcpToken: rootStyle.getPropertyValue("--chart-bcp").trim(),
        bcpLinkToken: rootStyle.getPropertyValue("--chart-bcp-link").trim(),
        bcpFill: bcpBar ? getComputedStyle(bcpBar).fill : "",
        bcpLinkFill: bcpLinkBar ? getComputedStyle(bcpLinkBar).fill : "",
      };
    });
    expect(colors.bcpToken).not.toBe("");
    expect(colors.bcpLinkToken).not.toBe("");
    expect(colors.bcpToken).not.toBe(colors.bcpLinkToken);
    expect(colors.bcpFill).not.toBe("");
    expect(colors.bcpLinkFill).not.toBe("");
    expect(colors.bcpFill).not.toBe(colors.bcpLinkFill);

    await page.screenshot({ path: testInfo.outputPath(`${key}.png`), fullPage: true });
  }
});
