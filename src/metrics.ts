import type { Language } from "./i18n";
import type { MetricKey, MetricMeta } from "./types";

export const METRICS: MetricMeta[] = [
  { key: "accuracy", format: "percent", fractionDigits: 2 },
  { key: "recall", format: "percent", fractionDigits: 2 },
  { key: "searchCalls", format: "number", fractionDigits: 2 },
  { key: "visitCalls", format: "number", fractionDigits: 2 },
  { key: "linkFollowingVisitCalls", format: "number", fractionDigits: 4 },
  { key: "turns", format: "number", fractionDigits: 2 },
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
  const metric = METRIC_BY_KEY[key];
  if (metric.format === "percent") return `${value.toFixed(metric.fractionDigits)}%`;
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    minimumFractionDigits: metric.fractionDigits,
    maximumFractionDigits: metric.fractionDigits,
  }).format(value);
}
