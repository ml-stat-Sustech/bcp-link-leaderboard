import type { MetricKey } from "./types";

export type Language = "en" | "zh";

interface MetricText {
  label: string;
  shortLabel: string;
  definition: string;
}

interface RulePrinciple {
  title: string;
  body: string;
}

interface ToolText {
  summary: string;
  input: string;
  retrieval: string;
  response: string;
}

export interface Translation {
  pageTitle: string;
  nav: {
    home: string;
    leaderboard: string;
    rules: string;
    metrics: string;
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
    bodyOneBeforeSearch: string;
    bodyOneBetweenTools: string;
    bodyOneAfterVisit: string;
    bodyTwo: string;
  };
  stats: {
    label: string;
    models: (count: number) => string;
    comparisons: (count: number) => string;
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
    noMatches: (query: string) => string;
    showing: (visible: number, total: number) => string;
  };
  comparison: {
    kicker: string;
    heading: string;
    comparable: (count: number, metric: string) => string;
    metricLabel: string;
    selectLabel: string;
    modelsLabel: string;
    modelPickerLabel: string;
    selectedModels: (count: number) => string;
    chartLabel: (metric: string) => string;
    overviewHeading: string;
    detailHeading: string;
    emptyHeading: (metric: string) => string;
    emptyBody: string;
  };
  metricGuide: {
    kicker: string;
    heading: string;
    note: string;
    categories: string;
    percentage: string;
    averageCount: string;
    footnote: string;
  };
  rules: {
    kicker: string;
    heading: string;
    note: string;
    principles: RulePrinciple[];
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
  metrics: Record<MetricKey, MetricText>;
}

export const LANGUAGE_STORAGE_KEY = "bcp-link-language";

export const TRANSLATIONS: Record<Language, Translation> = {
  en: {
    pageTitle: "BCP-Link Leaderboard",
    nav: {
      home: "BCP-Link home",
      leaderboard: "Leaderboard",
      rules: "Evaluation Rules",
      metrics: "Metric Guide",
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
      bodyOneBeforeSearch:
        "BCP-Link is a link-aware research agent benchmark built on BrowseComp-Plus. It uses a fixed corpus with standardized ",
      bodyOneBetweenTools: " and ",
      bodyOneAfterVisit: " tools so model results remain reproducible and directly comparable.",
      bodyTwo:
        "Gold evidence may not appear in the initial search results, but can be reached through links inside retrieved pages. This leaderboard shows which models can recognize those links, navigate to the right evidence, and complete the research task accurately.",
    },
    stats: {
      label: "Dataset summary",
      models: (count) => `${count} models`,
      comparisons: (count) => `${count} full comparisons`,
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
      noMatches: (query) => `No models match “${query}”.`,
      showing: (visible, total) => `Showing ${visible} of ${total} models`,
    },
    comparison: {
      kicker: "Benchmark comparison",
      heading: "BCP vs. BCP-Link",
      comparable: (count, metric) =>
        `${count} ${count === 1 ? "model" : "models"} with comparable ${metric} data`,
      metricLabel: "Metric",
      selectLabel: "Comparison metric",
      modelsLabel: "Models",
      modelPickerLabel: "Choose comparison models",
      selectedModels: (count) => `${count} ${count === 1 ? "model" : "models"} selected`,
      chartLabel: (metric) => `${metric} comparison chart`,
      overviewHeading: "Four-model overview",
      detailHeading: "Per-model detail",
      emptyHeading: (metric) => `No comparable ${metric} data yet`,
      emptyBody: "Add both BCP and BCP-Link values to the results CSV to populate this chart.",
    },
    metricGuide: {
      kicker: "Metric guide",
      heading: "How the leaderboard is measured",
      note: "All values are averages across the benchmark evaluation set.",
      categories:
        "Answer quality records Accuracy and Recall. Tool behavior records Search Calls, Visit Calls, and Turns. Link following records Link-following Visit Calls.",
      percentage: "Percentage",
      averageCount: "Average count",
      footnote:
        "Accuracy and Recall reward higher values. Tool calls and Turns describe agent behavior and efficiency; lower values are not automatically better.",
    },
    rules: {
      kicker: "Evaluation rules",
      heading: "One environment, the same tools",
      note: "Every model is evaluated against the same fixed resources and tool contract.",
      principles: [
        {
          title: "Fixed benchmark environment",
          body: "The corpus, query set, Elasticsearch index, prompts, and evaluation scripts stay fixed across model runs.",
        },
        {
          title: "No live web access",
          body: "Search and visit operate only on the local benchmark corpus, avoiding changes and failures from the live web.",
        },
        {
          title: "Link-aware navigation",
          body: "Gold evidence can sit beyond the first search results, so agents must recognize and follow useful text links.",
        },
      ],
      inputLabel: "Input",
      retrievalLabel: "Retrieval",
      responseLabel: "Response",
      search: {
        summary: "Find relevant documents in the fixed corpus with a focused natural-language query.",
        input: "query (required)",
        retrieval: "Fixed Elasticsearch index · title + text · hybrid · Qwen3-Embedding-8B",
        response: "Top 5 · highlight enabled · up to 5 fragments · 1,024-character snippets",
      },
      visit: {
        summary: "Open an exact URL found in a search result or linked from a previously visited document.",
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
    metrics: {
      accuracy: {
        label: "Accuracy",
        shortLabel: "Accuracy",
        definition: "Answer accuracy evaluated by Qwen3-32B as the LLM judge.",
      },
      recall: {
        label: "Recall",
        shortLabel: "Recall",
        definition: "Recall of evidence documents across all searched and visited documents.",
      },
      searchCalls: {
        label: "Search Calls",
        shortLabel: "Search Calls",
        definition: "Average number of search tool calls made by the agent.",
      },
      visitCalls: {
        label: "Visit Calls",
        shortLabel: "Visit Calls",
        definition: "Average number of visit tool calls made by the agent.",
      },
      linkFollowingVisitCalls: {
        label: "Link-following Visit Calls",
        shortLabel: "Link-following Visit Calls",
        definition: "Average visit calls triggered by links found in retrieved or visited documents.",
      },
      turns: {
        label: "Turns",
        shortLabel: "Turns",
        definition: "Average number of agent turns per task.",
      },
    },
  },
  zh: {
    pageTitle: "BCP-Link 模型排行榜",
    nav: {
      home: "返回 BCP-Link 首页",
      leaderboard: "排行榜",
      rules: "评测规则",
      metrics: "指标说明",
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
      bodyOneBeforeSearch:
        "BCP-Link 是基于 BrowseComp-Plus 构建的链接感知研究智能体基准。它使用固定语料，以及标准化的 ",
      bodyOneBetweenTools: " 和 ",
      bodyOneAfterVisit: " 工具，使不同模型的结果可复现、可直接比较。",
      bodyTwo:
        "关键证据不一定出现在初始搜索结果中，但可能通过检索页面内的链接到达。该排行榜用于衡量模型能否识别这些链接、导航至正确证据，并准确完成研究任务。",
    },
    stats: {
      label: "数据概览",
      models: (count) => `${count} 个模型`,
      comparisons: (count) => `${count} 个完整对比`,
    },
    leaderboard: {
      kicker: "主要结果",
      heading: "BCP-Link 排行榜",
      note: "统一 search 和 visit 工具 · 按答案准确率排名",
      searchLabel: "搜索模型",
      searchPlaceholder: "搜索模型",
      tableScrollLabel: "可横向滚动的排行榜表格",
      rank: "Rank",
      model: "Model",
      sortBy: (metric) => `按 ${metric} 排序`,
      noMatches: (query) => `没有与“${query}”匹配的模型。`,
      showing: (visible, total) => `正在显示 ${visible} / ${total} 个模型`,
    },
    comparison: {
      kicker: "基准对比",
      heading: "BCP 与 BCP-Link 对比",
      comparable: (count, metric) => `${count} 个模型具备可比较的${metric}数据`,
      metricLabel: "指标",
      selectLabel: "选择对比指标",
      modelsLabel: "模型",
      modelPickerLabel: "选择对比模型",
      selectedModels: (count) => `已选择 ${count} 个模型`,
      chartLabel: (metric) => `${metric}对比柱状图`,
      overviewHeading: "四个模型总览",
      detailHeading: "单模型详情",
      emptyHeading: (metric) => `暂无可比较的${metric}数据`,
      emptyBody: "请在结果 CSV 中同时添加 BCP 和 BCP-Link 数值。",
    },
    metricGuide: {
      kicker: "指标说明",
      heading: "排行榜指标如何计算",
      note: "所有数值均为基准评测集上的平均结果。",
      categories:
        "答案质量记录 Accuracy 和 Recall；工具行为记录 Search Calls、Visit Calls 和 Turns；链接跟随记录 Link-following Visit Calls。",
      percentage: "百分比",
      averageCount: "平均次数",
      footnote:
        "Accuracy 和 Recall 越高越好。工具调用次数和 Turns 用于描述智能体行为与效率，数值较低并不一定代表表现更好。",
    },
    rules: {
      kicker: "评测规则",
      heading: "统一环境，统一工具",
      note: "所有模型均使用相同的固定资源和工具协议进行评测。",
      principles: [
        {
          title: "固定评测环境",
          body: "不同模型运行时使用相同的语料、问题集、Elasticsearch 索引、提示词和评估脚本。",
        },
        {
          title: "不访问实时互联网",
          body: "search 和 visit 只访问本地基准语料，避免实时网页变化或访问失败影响结果。",
        },
        {
          title: "链接导航能力",
          body: "关键证据可能位于初始搜索结果之外，智能体需要识别并跟随有用的文本链接。",
        },
      ],
      inputLabel: "输入",
      retrievalLabel: "检索方式",
      responseLabel: "返回内容",
      search: {
        summary: "使用聚焦的自然语言查询，在固定语料中查找相关文档。",
        input: "query（必填）",
        retrieval: "固定 Elasticsearch 索引 · title + text · hybrid · Qwen3-Embedding-8B",
        response: "Top 5 · 开启 highlight · 最多 5 个 fragments · 1,024 字符 snippet",
      },
      visit: {
        summary: "打开搜索结果或已访问文档中出现的精确 URL。",
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
    metrics: {
      accuracy: {
        label: "Accuracy",
        shortLabel: "Accuracy",
        definition: "由 Qwen3-32B 作为 LLM judge 评估的答案准确率。",
      },
      recall: {
        label: "Recall",
        shortLabel: "Recall",
        definition: "所有搜索和访问过的文档相对于 evidence documents 的召回率。",
      },
      searchCalls: {
        label: "Search Calls",
        shortLabel: "Search Calls",
        definition: "智能体平均调用 search 工具的次数。",
      },
      visitCalls: {
        label: "Visit Calls",
        shortLabel: "Visit Calls",
        definition: "智能体平均调用 visit 工具的次数。",
      },
      linkFollowingVisitCalls: {
        label: "Link-following Visit Calls",
        shortLabel: "Link-following Visit Calls",
        definition: "由检索结果或已访问文档中的链接触发的平均访问次数。",
      },
      turns: {
        label: "Turns",
        shortLabel: "Turns",
        definition: "每个任务平均使用的智能体 turns 数量。",
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
