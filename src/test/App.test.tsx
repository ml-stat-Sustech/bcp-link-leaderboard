import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LeaderboardApp } from "../App";

const TEST_CSV = `Model,benchmark,Metrics,,,,,,备注
,,Accuracy,Recall,Search Calls,Visit Calls,Link-following Visit Calls,Turns number,运行脚本路径
Alpha,bcp-link,40.00%,,4,3,,,
,bcp,30.00%,,5,2,,,
Beta,bcp-link,60.00%,,6,,,,
,bcp,50.00%,,7,,,,
Gamma,bcp-link,,,,,,,
,bcp,,,,,,,
`;

function modelNames() {
  return screen.getAllByTestId("model-name").map((cell) => cell.textContent);
}

describe("LeaderboardApp", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "en-US",
    });
  });

  it("provides primary navigation, benchmark context, and metric definitions", () => {
    const { container } = render(<LeaderboardApp csvText={TEST_CSV} />);

    expect(screen.getByRole("link", { name: "Leaderboard" })).toHaveAttribute("href", "#leaderboard");
    expect(screen.getByRole("link", { name: "Comparison" })).toHaveAttribute("href", "#comparison");
    expect(screen.getByRole("link", { name: "Evaluation Rules" })).toHaveAttribute("href", "#rules");
    expect(screen.getByRole("link", { name: "Metric Guide" })).toHaveAttribute("href", "#metrics");
    expect(screen.getByRole("heading", { name: "BCP-Link", level: 1 })).toBeVisible();
    expect(
      screen.getByText("Evaluating whether search agents can find and follow useful links."),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "One environment, the same tools" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "How the leaderboard is measured" })).toBeVisible();
    expect(screen.getByText(/Gold evidence may not appear/)).toBeVisible();
    expect(screen.getByText(/Top 5 · highlight enabled · up to 5 fragments/)).toBeVisible();
    expect(screen.getByText(/40,000-character limit · no summarizer/)).toBeVisible();
    expect(screen.getByText("Each run is capped at 50 agent turns.")).toBeVisible();
    expect(screen.getByRole("heading", { name: /^Search$/ })).toBeVisible();
    expect(screen.getByRole("heading", { name: /^Visit$/ })).toBeVisible();
    expect(container.querySelectorAll(".rule-principles article")).toHaveLength(3);
    expect(container.querySelectorAll(".evaluation-flow li")).toHaveLength(6);
    expect(container.querySelector(".evaluation-flow")).toHaveTextContent("Second hop");
    expect(screen.queryByText("What is recorded")).not.toBeInTheDocument();

    const sectionIds = Array.from(container.querySelectorAll("main > section"), (section) => section.id);
    expect(sectionIds).toEqual(["about", "leaderboard", "comparison", "rules", "metrics"]);
  });

  it("opens and dismisses the responsive navigation with focus restoration", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);
    const trigger = screen.getByRole("button", { name: "Open navigation" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveAttribute(
      "data-open",
      "true",
    );
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("selects Chinese from the browser locale on first visit", () => {
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "zh-CN",
    });
    render(<LeaderboardApp csvText={TEST_CSV} />);

    expect(screen.getByRole("link", { name: "排行榜" })).toBeVisible();
    expect(screen.getByRole("link", { name: "评测规则" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "统一环境，统一工具" })).toBeVisible();
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.title).toBe("BCP-Link 模型排行榜");
  });

  it("switches language and theme while preserving active controls", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);

    await user.click(screen.getByRole("button", { name: "Sort by Visit Calls" }));
    await user.type(screen.getByRole("searchbox", { name: "Search models" }), "a");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Comparison metric" }),
      "recall",
    );
    await user.click(screen.getByRole("button", { name: "Choose color theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Teal Amber" }));
    await user.click(screen.getByRole("button", { name: "使用中文" }));

    expect(screen.getByRole("link", { name: "指标说明" })).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "搜索模型" })).toHaveValue("a");
    expect(screen.getByRole("combobox", { name: "选择对比指标" })).toHaveValue("recall");
    expect(modelNames()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(window.localStorage.getItem("bcp-link-language")).toBe("zh");
    expect(window.localStorage.getItem("bcp-link-theme")).toBe("teal-amber");
    expect(document.documentElement.dataset.theme).toBe("teal-amber");
    expect(screen.getByText(/Top 5 · 开启 highlight · 最多 5 个 fragments/)).toBeVisible();
    expect(screen.getByRole("columnheader", { name: /^Accuracy/ })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: /^Link-following Visit Calls/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "按 Accuracy 排序" })).toBeVisible();
    expect(
      within(screen.getByRole("combobox", { name: "选择对比指标" })).getByRole("option", {
        name: "Link-following Visit Calls",
      }),
    ).toBeInTheDocument();
  });

  it("defaults to Research Blue and supports every persisted theme", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);

    expect(document.documentElement.dataset.theme).toBe("research-blue");
    expect(window.localStorage.getItem("bcp-link-theme")).toBe("research-blue");

    const themes = [
      ["Sage Gold", "sage-gold"],
      ["Teal Amber", "teal-amber"],
      ["Warm Neutral", "warm-neutral"],
      ["Charcoal Amber", "charcoal-amber"],
      ["Research Blue", "research-blue"],
    ] as const;

    for (const [name, key] of themes) {
      await user.click(screen.getByRole("button", { name: "Choose color theme" }));
      await user.click(screen.getByRole("menuitemradio", { name: new RegExp(`^${name}`) }));
      expect(document.documentElement.dataset.theme).toBe(key);
      expect(window.localStorage.getItem("bcp-link-theme")).toBe(key);
    }
  });

  it("restores a valid saved theme", () => {
    window.localStorage.setItem("bcp-link-theme", "sage-gold");
    render(<LeaderboardApp csvText={TEST_CSV} />);

    expect(document.documentElement.dataset.theme).toBe("sage-gold");
  });

  it("falls back to Research Blue for the removed Rose Sage theme", () => {
    window.localStorage.setItem("bcp-link-theme", "rose-sage");
    render(<LeaderboardApp csvText={TEST_CSV} />);

    expect(document.documentElement.dataset.theme).toBe("research-blue");
    expect(window.localStorage.getItem("bcp-link-theme")).toBe("research-blue");
  });

  it("closes the theme menu with Escape or an outside click", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);
    const trigger = screen.getByRole("button", { name: "Choose color theme" });

    await user.click(trigger);
    expect(screen.getByRole("menu", { name: "Color themes" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu", { name: "Color themes" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(document.body);
    expect(screen.queryByRole("menu", { name: "Color themes" })).not.toBeInTheDocument();
  });

  it("uses accuracy ranking by default and keeps missing values last", () => {
    const { container } = render(<LeaderboardApp csvText={TEST_CSV} />);
    expect(modelNames()).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(screen.getByLabelText("Dataset summary")).toHaveTextContent("3 models");
    expect(screen.getByText("1 model with comparable Accuracy data")).toBeInTheDocument();
    expect(container.querySelectorAll(".rank-medal")).toHaveLength(2);
    expect(container.querySelector(".rank-medal.rank-1")).toHaveTextContent("1");
    expect(container.querySelectorAll(".percentage-data-bar")).toHaveLength(2);
    expect(container.querySelector(".percentage-data-bar")).toHaveStyle("--metric-fill: 60%");
  });

  it("selects one or more models for a shared comparison chart", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp />);

    expect(screen.getByTestId("comparison-chart")).toBeInTheDocument();
    expect(screen.getByText("4 models with comparable Accuracy data")).toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Choose comparison models" });
    await user.click(trigger);
    expect(screen.getAllByRole("checkbox")).toHaveLength(10);
    const selectAll = screen.getByRole("checkbox", { name: /Select all/ });
    expect(selectAll).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "Qwen3.6-27B" })).not.toBeChecked();
    const tongyi = screen.getByRole("checkbox", { name: "Tongyi-DeepResearch-30B-A3B" });
    const searchAgent = screen.getByRole("checkbox", { name: "SearchAgent-Zero" });
    const webExplorer = screen.getByRole("checkbox", { name: "WebExplorer-8B" });
    const webSailor = screen.getByRole("checkbox", { name: "WebSailor-32B" });
    expect(tongyi).toBeChecked();
    expect(searchAgent).toBeChecked();
    expect(webExplorer).toBeChecked();
    expect(webSailor).toBeChecked();

    await user.click(selectAll);
    expect(selectAll).toBeChecked();
    expect(trigger).toHaveTextContent("9 models selected");
    expect(screen.getByText("9 models with comparable Accuracy data")).toBeInTheDocument();

    await user.click(selectAll);
    expect(trigger).toHaveTextContent("0 models selected");
    expect(screen.getByRole("status")).toHaveTextContent("No models selected");
    expect(screen.queryByTestId("comparison-chart")).not.toBeInTheDocument();

    await user.click(tongyi);
    expect(trigger).toHaveTextContent("1 model selected");
    expect(screen.getByText("1 model with comparable Accuracy data")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-chart")).toBeInTheDocument();

    await user.click(searchAgent);
    expect(trigger).toHaveTextContent("2 models selected");
    expect(screen.getByText("2 models with comparable Accuracy data")).toBeInTheDocument();
  });

  it("filters by model name and sorts numeric columns", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);

    await user.click(screen.getByRole("button", { name: "Sort by Visit Calls" }));
    expect(modelNames()).toEqual(["Alpha", "Beta", "Gamma"]);

    await user.type(screen.getByRole("searchbox", { name: "Search models" }), "gamma");
    expect(modelNames()).toEqual(["Gamma"]);
    expect(screen.getByText("Showing 1 of 3 models")).toBeInTheDocument();
  });

  it("switches comparison metrics and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<LeaderboardApp csvText={TEST_CSV} />);

    const selector = screen.getByRole("combobox", { name: "Comparison metric" });
    expect(within(selector).getByRole("option", { name: "Accuracy" })).toBeInTheDocument();
    await user.selectOptions(selector, "recall");
    expect(screen.getByRole("status")).toHaveTextContent("No comparable Recall data yet");
  });

  it("renders an actionable error state for malformed input", () => {
    render(<LeaderboardApp csvText="Model,benchmark\n" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Results could not be loaded");
  });
});
