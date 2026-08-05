import type { Language } from "./i18n";
import type { MetricKey, MetricMeta } from "./types";

export const METRICS: MetricMeta[] = [
  { key: "accuracy", format: "percent" },
  { key: "recall", format: "percent" },
  { key: "searchCalls", format: "number" },
  { key: "visitCalls", format: "number" },
  { key: "linkFollowingVisitCalls", format: "number" },
  { key: "turns", format: "number" },
];

export const METRIC_BY_KEY = Object.fromEntries(
  METRICS.map((metric) => [metric.key, metric]),
) as Record<MetricKey, MetricMeta>;

export function formatMetricValue(
  key: MetricKey,
  value: number | null,
  language: Language = "en",
): string {
  if (value === null) return "—";
  if (METRIC_BY_KEY[key].format === "percent") return `${value.toFixed(2)}%`;
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
}
