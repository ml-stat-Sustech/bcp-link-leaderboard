import Papa from "papaparse";
import type { BenchmarkName, BenchmarkResult, MetricKey, ModelResults } from "./types";

const EXPECTED_METRIC_HEADERS = [
  "Accuracy",
  "Recall",
  "Search Calls",
  "Visit Calls",
  "Link-following Visit Calls",
  "Turns number",
];

const METRIC_COLUMNS: Array<{ key: MetricKey; index: number; percent: boolean }> = [
  { key: "accuracy", index: 2, percent: true },
  { key: "recall", index: 3, percent: true },
  { key: "searchCalls", index: 4, percent: false },
  { key: "visitCalls", index: 5, percent: false },
  { key: "linkFollowingVisitCalls", index: 6, percent: false },
  { key: "turns", index: 7, percent: false },
];

function parseMetric(rawValue: string | undefined, rowNumber: number, label: string, percent: boolean) {
  const value = (rawValue ?? "").trim();
  if (!value) return null;

  const normalized = percent && value.endsWith("%") ? value.slice(0, -1).trim() : value;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: ${label} contains an invalid number (${JSON.stringify(value)}).`);
  }
  return parsed;
}

function validateHeaders(rows: string[][]) {
  if (rows.length < 2) {
    throw new Error("The results CSV must contain two header rows.");
  }

  const firstHeader = (rows[0][0] ?? "").replace(/^\uFEFF/, "").trim();
  const benchmarkHeader = (rows[0][1] ?? "").trim().toLowerCase();
  if (firstHeader !== "Model" || benchmarkHeader !== "benchmark") {
    throw new Error("The CSV must begin with the Model and benchmark columns.");
  }

  EXPECTED_METRIC_HEADERS.forEach((expected, offset) => {
    const actual = (rows[1][offset + 2] ?? "").trim();
    if (actual !== expected) {
      throw new Error(`Expected metric column ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
    }
  });
}

export function parseBenchmarkCsv(csvText: string): ModelResults[] {
  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0];
    throw new Error(`CSV parsing failed near row ${(firstError.row ?? 0) + 1}: ${firstError.message}`);
  }

  const rows = parsed.data;
  validateHeaders(rows);

  const models = new Map<string, ModelResults>();
  let currentModel = "";

  rows.slice(2).forEach((row, index) => {
    const rowNumber = index + 3;
    const suppliedModel = (row[0] ?? "").replace(/^\uFEFF/, "").trim();
    if (suppliedModel) currentModel = suppliedModel;

    const benchmarkValue = (row[1] ?? "").trim().toLowerCase();
    if (!benchmarkValue && row.every((cell) => !cell.trim())) return;
    if (!currentModel) throw new Error(`Row ${rowNumber}: benchmark result has no model name.`);
    if (benchmarkValue !== "bcp" && benchmarkValue !== "bcp-link") {
      throw new Error(`Row ${rowNumber}: unsupported benchmark ${JSON.stringify(benchmarkValue)}.`);
    }

    const benchmark = benchmarkValue as BenchmarkName;
    const values = Object.fromEntries(
      METRIC_COLUMNS.map(({ key, index: columnIndex, percent }) => [
        key,
        parseMetric(row[columnIndex], rowNumber, EXPECTED_METRIC_HEADERS[columnIndex - 2], percent),
      ]),
    ) as Record<MetricKey, number | null>;

    const result: BenchmarkResult = {
      model: currentModel,
      benchmark,
      ...values,
    };

    const existing = models.get(currentModel) ?? {
      model: currentModel,
      bcp: null,
      bcpLink: null,
    };
    const slot = benchmark === "bcp" ? "bcp" : "bcpLink";
    if (existing[slot] !== null) {
      throw new Error(`Row ${rowNumber}: duplicate ${benchmark} result for ${currentModel}.`);
    }
    existing[slot] = result;
    models.set(currentModel, existing);
  });

  if (models.size === 0) throw new Error("The results CSV contains no model rows.");
  return Array.from(models.values());
}

export function getAccuracyRanks(models: ModelResults[]): Map<string, number> {
  const ranked = models
    .filter((model) => model.bcpLink?.accuracy !== null && model.bcpLink?.accuracy !== undefined)
    .sort((a, b) => (b.bcpLink?.accuracy ?? 0) - (a.bcpLink?.accuracy ?? 0));

  const ranks = new Map<string, number>();
  let previousScore: number | null = null;
  let previousRank = 0;
  ranked.forEach((model, index) => {
    const score = model.bcpLink!.accuracy!;
    const rank = score === previousScore ? previousRank : index + 1;
    ranks.set(model.model, rank);
    previousScore = score;
    previousRank = rank;
  });
  return ranks;
}
