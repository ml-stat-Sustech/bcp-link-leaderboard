export const METRIC_KEYS = [
  "accuracy",
  "recall",
  "searchCalls",
  "visitCalls",
  "linkFollowingVisitCalls",
  "turns",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];
export type BenchmarkName = "bcp" | "bcp-link";

export interface BenchmarkResult {
  model: string;
  benchmark: BenchmarkName;
  accuracy: number | null;
  recall: number | null;
  searchCalls: number | null;
  visitCalls: number | null;
  linkFollowingVisitCalls: number | null;
  turns: number | null;
}

export interface ModelResults {
  model: string;
  bcp: BenchmarkResult | null;
  bcpLink: BenchmarkResult | null;
}

export interface MetricMeta {
  key: MetricKey;
  format: "percent" | "number";
}
