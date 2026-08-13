import type { MetricKey } from "./types";

export type Language = "en" | "zh";

interface MetricText {
  label: string;
  shortLabel: string;
  definition: string;
  calculation: string;
  interpretation: string;
  direction: string;
}

interface RulePrinciple {
  title: string;
  body: string;
}

interface ToolText {
  title: string;
  summary: string;
  input: string;
  retrieval: string;
  response: string;
}

interface RuleFlowStep {
  title: string;
  detail: string;
}

export interface Translation {
  pageTitle: string;
  nav: {
    home: string;
    leaderboard: string;
    comparison: string;
    rules: string;
    metrics: string;
    label: string;
    openMenu: string;
    closeMenu: string;
  };
  language: {
    groupLabel: string;
    englishLabel: string;
    chineseLabel: string;
  };
  theme: {
    openLabel: string;
    closeLabel: string;
    menuLabel: string;
    selectedLabel: (theme: string) => string;
  };
  intro: {
    heading: string;
    subtitle: string;
    bodyOneAfterName: string;
    bodyOneBetweenTools: string;
    bodyOneAfterVisit: string;
    corpusBodyBeforeLink: string;
    corpusBodyAfterLink: string;
    bodyThree: string;
    rankingsAction: string;
    protocolAction: string;
    codeAction: string;
    datasetAction: string;
    comingSoon: string;
    codeActionLabel: string;
    datasetActionLabel: string;
  };
  stats: {
    label: string;
    placeholder: string;
    documents: string;
    links: string;
    queries: string;
  };
  leaderboard: {
    kicker: string;
    heading: string;
    note: string;
    searchLabel: string;
    searchPlaceholder: string;
    tableScrollLabel: string;
    rank: string;
    model: string;
    sortBy: (metric: string) => string;
    sortStatus: (metric: string, direction: "asc" | "desc") => string;
    noMatches: (query: string) => string;
    showing: (visible: number, total: number) => string;
    downloadCsv: string;
    downloadCsvLabel: string;
  };
  comparison: {
    kicker: string;
    heading: string;
    comparable: (count: number, metric: string) => string;
    insightsLabel: string;
    trainedInsightBefore: string;
    trainedInsightEmphasis: string;
    trainedInsightAfter: string;
    untrainedInsight: string;
    metricLabel: string;
    selectLabel: string;
    modelsLabel: string;
    modelPickerLabel: string;
    selectAllModels: string;
    selectedModels: (count: number) => string;
    chartLabel: (metric: string) => string;
    overviewHeading: string;
    detailHeading: string;
    emptyHeading: (metric: string) => string;
    emptyBody: string;
    emptySelectionHeading: string;
    emptySelectionBody: string;
    deltaLabel: string;
    percentagePoints: string;
  };
  metricGuide: {
    kicker: string;
    heading: string;
    note: string;
    groups: {
      answerQuality: string;
      toolBehavior: string;
      linkFollowing: string;
    };
    percentage: string;
    averageCount: string;
    definitionLabel: string;
    calculationLabel: string;
    interpretationLabel: string;
    openMetricDetails: (metric: string) => string;
    unpinMetricDetails: (metric: string) => string;
    pinnedStatus: string;
    footnote: string;
  };
  rules: {
    kicker: string;
    heading: string;
    note: string;
    principles: RulePrinciple[];
    flowScrollLabel: string;
    flowSteps: RuleFlowStep[];
    inputLabel: string;
    retrievalLabel: string;
    responseLabel: string;
    search: ToolText;
    visit: ToolText;
    turnLimit: string;
  };
  errors: {
    heading: string;
    unknown: string;
  };
  footer: {
    description: string;
    navigationLabel: string;
    leaderboardLabel: string;
    comparisonLabel: string;
    rulesLabel: string;
    backToTop: string;
  };
  metrics: Record<MetricKey, MetricText>;
}

export const LANGUAGE_STORAGE_KEY = "bcp-link-language";

export const TRANSLATIONS: Record<Language, Translation> = {
  en: {
    pageTitle: "BCP-Link Leaderboard",
    nav: {
      home: "BCP-Link home",
      leaderboard: "Leaderboard",
      comparison: "Comparison",
      rules: "Evaluation Rules",
      metrics: "Metric Guide",
      label: "Primary navigation",
      openMenu: "Open navigation",
      closeMenu: "Close navigation",
    },
    language: {
      groupLabel: "Language",
      englishLabel: "Use English",
      chineseLabel: "使用中文",
    },
    theme: {
      openLabel: "Choose color theme",
      closeLabel: "Close color themes",
      menuLabel: "Color themes",
      selectedLabel: (theme) => `${theme} selected`,
    },
    intro: {
      heading: "BCP-Link",
      subtitle: "Evaluating whether search agents can find and follow useful links.",
      bodyOneAfterName:
        " is a link-aware search-agent benchmark built on BrowseComp-Plus. It uses a fixed corpus with standardized ",
      bodyOneBetweenTools: " and ",
      bodyOneAfterVisit: " tools so model results remain reproducible and directly comparable.",
      corpusBodyBeforeLink: "The BCP-Link evaluation corpus extends the ",
      corpusBodyAfterLink:
        " (BCP) corpus. The expanded corpus supports direct navigation between related documents, allowing an agent to move from the document it is reading to relevant follow-up documents and continue gathering evidence, reducing repeated searches and result rematching.",
      bodyThree:
        "Key evidence may therefore lie beyond the initial search results and require following links across documents. BCP-Link evaluates not only answer accuracy, but also whether models can recognize useful links, navigate across documents, and reach the correct evidence efficiently.",
      rankingsAction: "View rankings",
      protocolAction: "Review protocol",
      codeAction: "Code",
      datasetAction: "Dataset",
      comingSoon: "Coming soon",
      codeActionLabel: "Code on GitHub, coming soon",
      datasetActionLabel: "Dataset, coming soon",
    },
    stats: {
      label: "Dataset summary",
      placeholder: "TBD",
      documents: "Corpus documents",
      links: "Links",
      queries: "Evaluation queries",
    },
    leaderboard: {
      kicker: "Main results",
      heading: "BCP-Link leaderboard",
      note: "Standard search and visit tools · Ranked by answer accuracy",
      searchLabel: "Search models",
      searchPlaceholder: "Search models",
      tableScrollLabel: "Scrollable leaderboard table",
      rank: "Rank",
      model: "Model",
      sortBy: (metric) => `Sort by ${metric}`,
      sortStatus: (metric, direction) =>
        `Sorted by ${metric}, ${direction === "asc" ? "ascending" : "descending"}`,
      noMatches: (query) => `No models match “${query}”.`,
      showing: (visible, total) => `Showing ${visible} of ${total} models`,
      downloadCsv: "Download CSV",
      downloadCsvLabel: "Download leaderboard results as CSV",
    },
    comparison: {
      kicker: "Benchmark comparison",
      heading: "BCP vs. BCP-Link",
      comparable: (count, metric) =>
        `${count} ${count === 1 ? "model" : "models"} with comparable ${metric} data`,
      insightsLabel: "Key findings from the BCP and BCP-Link comparison",
      trainedInsightBefore:
        "For models trained to use comparable tools, BCP-Link achieves ",
      trainedInsightEmphasis: "higher Accuracy",
      trainedInsightAfter: " than BCP with fewer agent turns.",
      untrainedInsight:
        "For models without relevant tool-use training, or trained with materially different tool interfaces (such as summary-returning Visit tools), the overall performance difference between BCP and BCP-Link is limited.",
      metricLabel: "Metric",
      selectLabel: "Comparison metric",
      modelsLabel: "Models",
      modelPickerLabel: "Choose comparison models",
      selectAllModels: "Select all",
      selectedModels: (count) => `${count} ${count === 1 ? "model" : "models"} selected`,
      chartLabel: (metric) => `${metric} comparison chart`,
      overviewHeading: "Four-model overview",
      detailHeading: "Per-model detail",
      emptyHeading: (metric) => `No comparable ${metric} data yet`,
      emptyBody: "Add both BCP and BCP-Link values to the results CSV to populate this chart.",
      emptySelectionHeading: "No models selected",
      emptySelectionBody: "Select one or more models above to add them to the comparison.",
      deltaLabel: "Difference",
      percentagePoints: "pp",
    },
    metricGuide: {
      kicker: "Metric guide",
      heading: "How the leaderboard is measured",
      note: "All values are averages across the benchmark evaluation set.",
      groups: {
        answerQuality: "Answer quality",
        toolBehavior: "Tool behavior",
        linkFollowing: "Link following",
      },
      percentage: "Percentage",
      averageCount: "Average count",
      definitionLabel: "What it measures",
      calculationLabel: "Calculation or source",
      interpretationLabel: "How to read it",
      openMetricDetails: (metric) => `View ${metric} details`,
      unpinMetricDetails: (metric) => `Unpin ${metric} details`,
      pinnedStatus: "Pinned",
      footnote:
        "Accuracy and Recall reward higher values. Tool calls and Turns describe agent behavior and efficiency; lower values are not automatically better.",
    },
    rules: {
      kicker: "Evaluation rules",
      heading: "One fixed process, two standard tools",
      note:
        "Every model is evaluated through the same reproducible pipeline with the same search and visit interfaces.",
      principles: [
        {
          title: "Reproducible by design",
          body: "Every run follows one fixed evaluation process: the same corpus, query set, Elasticsearch index, prompts, turn limit, and scoring scripts.",
        },
        {
          title: "Link-aware navigation",
          body: "Gold evidence can sit beyond the first search results, so agents must recognize and follow useful text links.",
        },
        {
          title: "Two standard tools",
          body: "All models receive the same two tools, search and visit, with identical inputs and outputs for a fair comparison.",
        },
      ],
      flowScrollLabel: "Evaluation path from query to answer",
      flowSteps: [
        { title: "Query", detail: "Question" },
        { title: "Search", detail: "Initial retrieval" },
        { title: "Visit", detail: "Open result" },
        { title: "Visit", detail: "Second hop" },
        { title: "Evidence", detail: "Grounded source" },
        { title: "Answer", detail: "Final response" },
      ],
      inputLabel: "Input",
      retrievalLabel: "Retrieval",
      responseLabel: "Response",
      search: {
        title: "Search",
        summary: "Focused retrieval from the fixed benchmark corpus.",
        input: "query (required)",
        retrieval: "Fixed Elasticsearch index · title + text · hybrid · Qwen3-Embedding-8B",
        response: "Top 5 · highlight enabled · up to 5 fragments · 1,024-character snippets",
      },
      visit: {
        title: "Visit",
        summary: "Open a result URL or follow a link from a visited document.",
        input: "document_id (required) · goal (optional)",
        retrieval: "Exact, unmodified URL · fixed corpus lookup · no live web fetch",
        response: "Full document text · 40,000-character limit · no summarizer",
      },
      turnLimit: "Each run is capped at 50 agent turns.",
    },
    errors: {
      heading: "Results could not be loaded",
      unknown: "An unknown data error occurred.",
    },
    footer: {
      description: "A link-aware benchmark for search agents.",
      navigationLabel: "Footer navigation",
      leaderboardLabel: "View leaderboard",
      comparisonLabel: "View benchmark comparison",
      rulesLabel: "View evaluation rules",
      backToTop: "Back to top",
    },
    metrics: {
      accuracy: {
        label: "Accuracy",
        shortLabel: "Accuracy",
        definition: "Answer accuracy evaluated by Qwen3-32B as the LLM judge.",
        calculation: "Share of evaluated answers judged accurate by Qwen3-32B.",
        interpretation: "Higher values indicate that more benchmark questions were answered correctly.",
        direction: "Higher is better",
      },
      recall: {
        label: "Recall",
        shortLabel: "Recall",
        definition: "Recall of evidence documents across all searched and visited documents.",
        calculation: "Evidence documents found across search and visit outputs relative to the gold evidence set.",
        interpretation: "Higher values indicate broader recovery of the evidence needed to answer each query.",
        direction: "Higher is better",
      },
      searchCalls: {
        label: "Search Calls",
        shortLabel: "Search Calls",
        definition: "Average number of search tool calls made by the agent.",
        calculation: "Mean count of search tool invocations per evaluated task.",
        interpretation: "This describes retrieval strategy; more or fewer calls are not automatically better.",
        direction: "Context dependent",
      },
      visitCalls: {
        label: "Visit Calls",
        shortLabel: "Visit Calls",
        definition: "Average number of visit tool calls made by the agent.",
        calculation: "Mean count of visit tool invocations per evaluated task.",
        interpretation: "Read this with answer quality to distinguish useful exploration from extra work.",
        direction: "Context dependent",
      },
      linkFollowingVisitCalls: {
        label: "Link-following Visit Calls",
        shortLabel: "Link-following Visit Calls",
        definition: "Average visit calls triggered by links found in retrieved or visited documents.",
        calculation: "Mean count of visits initiated from links discovered in benchmark documents.",
        interpretation: "Shows link-navigation behavior; a higher count alone does not prove better navigation.",
        direction: "Context dependent",
      },
      turns: {
        label: "Turns",
        shortLabel: "Turns",
        definition: "Average number of agent turns per task.",
        calculation: "Mean agent turns used per task, with each run capped at 50 turns.",
        interpretation: "Fewer turns can indicate efficiency only when answer quality remains comparable.",
        direction: "Context dependent",
      },
    },
  },
  zh: {
    pageTitle: "BCP-Link 模型排行榜",
    nav: {
      home: "返回 BCP-Link 首页",
      leaderboard: "排行榜",
      comparison: "基准对比",
      rules: "评测规则",
      metrics: "指标说明",
      label: "主导航",
      openMenu: "打开导航",
      closeMenu: "关闭导航",
    },
    language: {
      groupLabel: "语言",
      englishLabel: "Use English",
      chineseLabel: "使用中文",
    },
    theme: {
      openLabel: "选择网页配色",
      closeLabel: "关闭配色选择",
      menuLabel: "网页配色",
      selectedLabel: (theme) => `已选择${theme}`,
    },
    intro: {
      heading: "BCP-Link",
      subtitle: "Evaluating whether search agents can find and follow useful links.",
      bodyOneAfterName:
        " 是基于 BrowseComp-Plus 构建的链接感知搜索智能体基准。它使用固定语料，以及标准化的 ",
      bodyOneBetweenTools: " 和 ",
      bodyOneAfterVisit: " 工具，使不同模型的结果可复现、可直接比较。",
      corpusBodyBeforeLink: "BCP-Link 的评测语料基于 ",
      corpusBodyAfterLink:
        "（BCP）语料扩充而来。扩充后的语料支持相关文档之间的直接跳转，使智能体能够在阅读当前文档时进入后续文档并继续收集证据，从而减少反复搜索与重新匹配的过程。",
      bodyThree:
        "因此，关键证据未必出现在初始搜索结果中，也可能需要沿文档链接进一步获取。BCP-Link 不仅考察答案准确性，还衡量模型能否识别有用链接、完成跨文档导航，并高效找到正确证据。",
      rankingsAction: "查看排行榜",
      protocolAction: "阅读评测规则",
      codeAction: "Code",
      datasetAction: "Dataset",
      comingSoon: "即将开放",
      codeActionLabel: "GitHub 上的代码，即将开放",
      datasetActionLabel: "数据集，即将开放",
    },
    stats: {
      label: "数据概览",
      placeholder: "待补",
      documents: "语料文档",
      links: "链接",
      queries: "评测问题",
    },
    leaderboard: {
      kicker: "主要结果",
      heading: "BCP-Link 排行榜",
      note: "统一 search 和 visit 工具 · 按答案准确率排名",
      searchLabel: "搜索模型",
      searchPlaceholder: "搜索模型",
      tableScrollLabel: "可横向和纵向滚动的排行榜表格",
      rank: "Rank",
      model: "Model",
      sortBy: (metric) => `按 ${metric} 排序`,
      sortStatus: (metric, direction) =>
        `当前按 ${metric} ${direction === "asc" ? "升序" : "降序"}排列`,
      noMatches: (query) => `没有与“${query}”匹配的模型。`,
      showing: (visible, total) => `正在显示 ${visible} / ${total} 个模型`,
      downloadCsv: "下载 CSV",
      downloadCsvLabel: "下载排行榜结果 CSV",
    },
    comparison: {
      kicker: "基准对比",
      heading: "BCP 与 BCP-Link 对比",
      comparable: (count, metric) => `${count} 个模型具备可比较的${metric}数据`,
      insightsLabel: "BCP 与 BCP-Link 对比的主要结论",
      trainedInsightBefore: "对于接受过相关工具使用训练的模型，BCP-Link 能以更少的对话轮数取得",
      trainedInsightEmphasis: "优于 BCP 的 Accuracy",
      trainedInsightAfter: "。",
      untrainedInsight:
        "对于未接受过相关工具使用训练，或训练时使用的工具形态与本评测存在明显差异（例如 Visit 工具返回摘要）的模型，BCP 与 BCP-Link 的整体表现差异不明显。",
      metricLabel: "指标",
      selectLabel: "选择对比指标",
      modelsLabel: "模型",
      modelPickerLabel: "选择对比模型",
      selectAllModels: "全选",
      selectedModels: (count) => `已选择 ${count} 个模型`,
      chartLabel: (metric) => `${metric}对比柱状图`,
      overviewHeading: "四个模型总览",
      detailHeading: "单模型详情",
      emptyHeading: (metric) => `暂无可比较的${metric}数据`,
      emptyBody: "请在结果 CSV 中同时添加 BCP 和 BCP-Link 数值。",
      emptySelectionHeading: "尚未选择模型",
      emptySelectionBody: "请在上方选择一个或多个模型加入对比。",
      deltaLabel: "差值",
      percentagePoints: "百分点",
    },
    metricGuide: {
      kicker: "指标说明",
      heading: "排行榜指标如何计算",
      note: "所有数值均为基准评测集上的平均结果。",
      groups: {
        answerQuality: "答案质量",
        toolBehavior: "工具行为",
        linkFollowing: "链接跟随",
      },
      percentage: "百分比",
      averageCount: "平均次数",
      definitionLabel: "衡量内容",
      calculationLabel: "计算或来源",
      interpretationLabel: "解读方式",
      openMetricDetails: (metric) => `查看 ${metric} 详情`,
      unpinMetricDetails: (metric) => `取消固定 ${metric} 详情`,
      pinnedStatus: "已固定",
      footnote:
        "Accuracy 和 Recall 越高越好。工具调用次数和 Turns 用于描述智能体行为与效率，数值较低并不一定代表表现更好。",
    },
    rules: {
      kicker: "评测规则",
      heading: "固定流程，两种标准工具",
      note: "所有模型均在同一套可复现流程中，使用相同的 search 与 visit 工具接口进行评测。",
      principles: [
        {
          title: "可复现评测",
          body: "每次运行都遵循同一套固定流程：使用相同的语料、问题集、Elasticsearch 索引、提示词、turn 上限和评分脚本。",
        },
        {
          title: "链接感知导航",
          body: "关键证据可能位于初始搜索结果之外，智能体需要识别并跟随有用的文本链接。",
        },
        {
          title: "两种标准工具",
          body: "所有模型都使用输入与输出完全一致的 search 和 visit 两种标准工具，确保模型间比较公平。",
        },
      ],
      flowScrollLabel: "从 Query 到 Answer 的评测流程",
      flowSteps: [
        { title: "Query", detail: "评测问题" },
        { title: "Search", detail: "初始检索" },
        { title: "Visit", detail: "打开结果" },
        { title: "Visit", detail: "二次跳转" },
        { title: "Evidence", detail: "获取证据" },
        { title: "Answer", detail: "生成答案" },
      ],
      inputLabel: "输入",
      retrievalLabel: "检索方式",
      responseLabel: "返回内容",
      search: {
        title: "Search",
        summary: "使用聚焦查询，从固定基准语料中检索相关文档。",
        input: "query（必填）",
        retrieval: "固定 Elasticsearch 索引 · title + text · hybrid · Qwen3-Embedding-8B",
        response: "Top 5 · 开启 highlight · 最多 5 个 fragments · 1,024 字符 snippet",
      },
      visit: {
        title: "Visit",
        summary: "打开结果 URL，或跟随已访问文档中的链接。",
        input: "document_id（必填）· goal（可选）",
        retrieval: "URL 必须保持原样 · 查询固定语料 · 不访问实时网页",
        response: "返回完整文档文本 · 40,000 字符上限 · 不使用 summarizer",
      },
      turnLimit: "每次运行最多允许 50 个智能体 turns。",
    },
    errors: {
      heading: "无法加载评测结果",
      unknown: "发生未知数据错误。",
    },
    footer: {
      description: "面向搜索智能体的链接感知评测基准。",
      navigationLabel: "页尾导航",
      leaderboardLabel: "查看排行榜",
      comparisonLabel: "查看基准对比",
      rulesLabel: "查看评测规则",
      backToTop: "返回顶部",
    },
    metrics: {
      accuracy: {
        label: "Accuracy",
        shortLabel: "Accuracy",
        definition: "由 Qwen3-32B 作为 LLM judge 评估的答案准确率。",
        calculation: "由 Qwen3-32B 判定为准确的答案占全部评测答案的比例。",
        interpretation: "数值越高，表示正确回答的基准问题越多。",
        direction: "越高越好",
      },
      recall: {
        label: "Recall",
        shortLabel: "Recall",
        definition: "所有搜索和访问过的文档相对于 evidence documents 的召回率。",
        calculation: "search 和 visit 输出中找到的证据文档相对于标准证据集的比例。",
        interpretation: "数值越高，表示回答每个问题所需的证据覆盖得越完整。",
        direction: "越高越好",
      },
      searchCalls: {
        label: "Search Calls",
        shortLabel: "Search Calls",
        definition: "智能体平均调用 search 工具的次数。",
        calculation: "所有评测任务中 search 工具调用次数的平均值。",
        interpretation: "该数值描述检索策略，调用更多或更少并不自动代表更好。",
        direction: "需结合情境",
      },
      visitCalls: {
        label: "Visit Calls",
        shortLabel: "Visit Calls",
        definition: "智能体平均调用 visit 工具的次数。",
        calculation: "所有评测任务中 visit 工具调用次数的平均值。",
        interpretation: "需结合答案质量判断这些访问是有效探索还是额外开销。",
        direction: "需结合情境",
      },
      linkFollowingVisitCalls: {
        label: "Link-following Visit Calls",
        shortLabel: "Link-following Visit Calls",
        definition: "由检索结果或已访问文档中的链接触发的平均访问次数。",
        calculation: "从基准文档中发现的链接继续发起访问的平均次数。",
        interpretation: "用于描述链接导航行为；次数更高本身并不能证明导航效果更好。",
        direction: "需结合情境",
      },
      turns: {
        label: "Turns",
        shortLabel: "Turns",
        definition: "每个任务平均使用的智能体 turns 数量。",
        calculation: "每项任务所用智能体 turns 的平均值，每次运行最多 50 turns。",
        interpretation: "仅在答案质量相近时，较少 turns 才能体现更高效率。",
        direction: "需结合情境",
      },
    },
  },
};

export function resolveInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "zh") return stored;
  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}
