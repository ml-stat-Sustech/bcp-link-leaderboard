import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  Database,
  Github,
  Info,
  Link2,
  ListFilter,
  Menu,
  Palette,
  Pin,
  Search,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Papa from "papaparse";
import resultsCsv from "../data/bcp-link-results.csv?raw";
import brandLogoDark from "./assets/bcp-link-logo-dark.svg";
import { getAccuracyRanks, parseBenchmarkCsv } from "./data";
import { EvaluationRules } from "./EvaluationRules";
import {
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
  TRANSLATIONS,
  type Language,
  type Translation,
} from "./i18n";
import {
  formatMetricValue,
  getComparisonValuesDomain,
  METRIC_BY_KEY,
  METRICS,
} from "./metrics";
import {
  resolveInitialTheme,
  THEMES,
  THEME_STORAGE_KEY,
  type ThemeKey,
} from "./themes";
import type { MetricKey, ModelResults } from "./types";

type SortDirection = "asc" | "desc";

interface SortState {
  key: MetricKey;
  direction: SortDirection;
}

interface LeaderboardAppProps {
  csvText?: string;
}

const BROWSECOMP_PLUS_PAPER_URL = "https://arxiv.org/pdf/2508.06600";
const CODE_RELEASE_URL = "https://github.com/ml-stat-Sustech/SearcherKit";
const DATASET_RELEASE_URL = "https://huggingface.co/datasets/SUSTech/BCP-Link-corpus";

const DEFAULT_COMPARISON_MODEL_NAMES = [
  "Tongyi-DeepResearch-30B-A3B",
  "SearchAgent-Zero",
  "WebExplorer-8B",
  "WebSailor-32B",
] as const;

const METRIC_GROUPS = [
  {
    key: "answerQuality",
    metrics: ["accuracy", "recall"],
  },
  {
    key: "toolBehavior",
    metrics: ["searchCalls", "visitCalls", "turns"],
  },
  {
    key: "linkFollowing",
    metrics: ["linkFollowingVisitCalls"],
  },
] as const satisfies readonly {
  key: keyof Translation["metricGuide"]["groups"];
  metrics: readonly MetricKey[];
}[];

const METRIC_GUIDE_METRICS = METRIC_GROUPS.flatMap((group) =>
  group.metrics.map((metricKey) => METRIC_BY_KEY[metricKey]),
);

const LEADERBOARD_METRICS = [
  "accuracy",
  "recall",
  "searchCalls",
  "visitCalls",
  "linkFollowingVisitCalls",
  "turns",
] satisfies readonly MetricKey[];

const LEADERBOARD_EXPORT_HEADERS = [
  "Rank",
  "Model",
  "Accuracy",
  "Recall",
  "Search Calls",
  "Visit Calls",
  "Link-following Visit Calls",
  "Turns",
] as const;

const METRIC_CATEGORY_BY_KEY = Object.fromEntries(
  METRIC_GROUPS.flatMap((group) => group.metrics.map((metricKey) => [metricKey, group.key])),
) as Record<MetricKey, keyof Translation["metricGuide"]["groups"]>;

function formatModelDisplayName(model: string): string {
  return model.replace(/^gemma(?=-)/i, "Gemma");
}

function formatLeaderboardModelName(model: string): string {
  const displayName = formatModelDisplayName(model);
  return displayName.charAt(0).toLocaleUpperCase() + displayName.slice(1);
}

function renderInlineCode(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function createLeaderboardCsv(models: ModelResults[], ranks: Map<string, number>): string {
  const rows = models.map((model) => [
    ranks.get(model.model) ?? "",
    formatModelDisplayName(model.model),
    ...LEADERBOARD_METRICS.map((metricKey) => {
      const value = model.bcpLink?.[metricKey] ?? null;
      return value === null ? "" : formatMetricValue(metricKey, value, "en");
    }),
  ]);

  return `\uFEFF${Papa.unparse([LEADERBOARD_EXPORT_HEADERS, ...rows], {
    newline: "\r\n",
  })}\r\n`;
}

function ThemePicker({
  theme,
  language,
  copy,
  onChange,
}: {
  theme: ThemeKey;
  language: Language;
  copy: Translation;
  onChange: (theme: ThemeKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const pickerId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedTheme = THEMES.find((option) => option.key === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        className="theme-trigger"
        type="button"
        aria-label={open ? copy.theme.closeLabel : copy.theme.openLabel}
        aria-expanded={open}
        aria-controls={pickerId}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
        }}
        onClick={() => setOpen((current) => !current)}
      >
        <Palette aria-hidden="true" />
        <span className="theme-trigger-swatches" aria-hidden="true">
          {selectedTheme.colors.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div id={pickerId} className="theme-menu" role="menu" aria-label={copy.theme.menuLabel}>
          {THEMES.map((option) => {
            const selected = option.key === theme;
            const name = option.name[language];
            return (
              <button
                key={option.key}
                className="theme-option"
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                aria-label={selected ? copy.theme.selectedLabel(name) : name}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                  triggerRef.current?.focus({ preventScroll: true });
                }}
              >
                <span className="theme-option-swatches" aria-hidden="true">
                  {option.colors.map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </span>
                <span>{name}</span>
                {selected && <Check aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LanguageSwitch({
  language,
  copy,
  onChange,
}: {
  language: Language;
  copy: Translation;
  onChange: (language: Language) => void;
}) {
  return (
    <div className="language-switch" role="group" aria-label={copy.language.groupLabel}>
      <button
        type="button"
        aria-label={copy.language.englishLabel}
        aria-pressed={language === "en"}
        onClick={() => onChange("en")}
      >
        <span className="language-code">EN</span>
        <span className="language-name">English</span>
      </button>
      <button
        type="button"
        aria-label={copy.language.chineseLabel}
        aria-pressed={language === "zh"}
        onClick={() => onChange("zh")}
      >
        <span className="language-code">中</span>
        <span className="language-name">中文</span>
      </button>
    </div>
  );
}

function PrimaryNavigation({ copy }: { copy: Translation }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const links = [
    ["#leaderboard", copy.nav.leaderboard],
    ["#comparison", copy.nav.comparison],
    ["#rules", copy.nav.rules],
    ["#metrics", copy.nav.metrics],
  ] as const;

  return (
    <div className="navigation-root" ref={rootRef}>
      <button
        ref={triggerRef}
        className="mobile-menu-trigger"
        type="button"
        aria-label={open ? copy.nav.closeMenu : copy.nav.openMenu}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav
        id={menuId}
        className="primary-nav"
        data-open={open ? "true" : "false"}
        aria-label={copy.nav.label}
      >
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function compareModels(a: ModelResults, b: ModelResults, sort: SortState): number {
  const aValue = a.bcpLink?.[sort.key] ?? null;
  const bValue = b.bcpLink?.[sort.key] ?? null;

  if (aValue === null && bValue === null) return a.model.localeCompare(b.model);
  if (aValue === null) return 1;
  if (bValue === null) return -1;
  const difference = aValue - bValue;
  return sort.direction === "asc" ? difference : -difference;
}

function SortIndicator({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown aria-hidden="true" />;
  return direction === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />;
}

function MetricHeader({
  metricKey,
  sort,
  onSort,
  copy,
}: {
  metricKey: MetricKey;
  sort: SortState;
  onSort: (key: MetricKey) => void;
  copy: Translation;
}) {
  const metric = copy.metrics[metricKey];
  return (
    <div className="metric-header">
      <button
        className="sort-button"
        type="button"
        onClick={() => onSort(metricKey)}
        aria-label={copy.leaderboard.sortBy(metric.label)}
        aria-pressed={sort.key === metricKey}
      >
        <span>{metric.shortLabel}</span>
        <SortIndicator active={sort.key === metricKey} direction={sort.direction} />
      </button>
      <span className="info-tip" title={metric.definition} aria-label={metric.definition}>
        <Info aria-hidden="true" />
      </span>
    </div>
  );
}

function LeaderboardTable({
  models,
  language,
  copy,
}: {
  models: ModelResults[];
  language: Language;
  copy: Translation;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "accuracy", direction: "desc" });
  const [tableScrollState, setTableScrollState] = useState({
    scrollable: false,
    atBottom: true,
  });
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const ranks = useMemo(() => getAccuracyRanks(models), [models]);

  const visibleModels = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return models
      .filter((model) => model.model.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => compareModels(a, b, sort));
  }, [models, query, sort]);
  const csvDownloadHref = useMemo(
    () =>
      `data:text/csv;charset=utf-8,${encodeURIComponent(
        createLeaderboardCsv(visibleModels, ranks),
      )}`,
    [ranks, visibleModels],
  );

  const handleSort = (key: MetricKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const updateTableScrollState = (element: HTMLDivElement) => {
    const scrollable = element.scrollHeight > element.clientHeight + 1;
    const atBottom =
      !scrollable || element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
    setTableScrollState((current) =>
      current.scrollable === scrollable && current.atBottom === atBottom
        ? current
        : { scrollable, atBottom },
    );
  };

  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    if (!tableScroll) return;

    const update = () => updateTableScrollState(tableScroll);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [visibleModels.length]);

  const renderLeaderboardSurface = () => (
    <div className="leaderboard-surface">
      <div className="leaderboard-toolbar">
        <div className="leaderboard-status" aria-live="polite">
          <strong>{copy.leaderboard.showing(visibleModels.length, models.length)}</strong>
          <span>
            {copy.leaderboard.sortStatus(copy.metrics[sort.key].label, sort.direction)}
          </span>
        </div>
        <label className="search-field">
          <Search aria-hidden="true" />
          <span className="sr-only">{copy.leaderboard.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.leaderboard.searchPlaceholder}
          />
        </label>
      </div>

      <div
        className="table-shell"
        data-scrollable={tableScrollState.scrollable ? "true" : "false"}
        data-at-bottom={tableScrollState.atBottom ? "true" : "false"}
      >
        <div
          ref={tableScrollRef}
          className="table-scroll"
          tabIndex={0}
          aria-label={copy.leaderboard.tableScrollLabel}
          onScroll={(event) => updateTableScrollState(event.currentTarget)}
        >
          <table>
            <colgroup>
              <col className="rank-column-track" />
              <col className="model-column-track" />
              {LEADERBOARD_METRICS.map((metricKey) => (
                <col
                  key={metricKey}
                  className={`metric-column-track metric-track-${metricKey}`}
                />
              ))}
            </colgroup>
            <thead>
              <tr className="metric-label-row">
                <th className="rank-column" scope="col">
                  {copy.leaderboard.rank}
                </th>
                <th className="model-column" scope="col">
                  {copy.leaderboard.model}
                </th>
                {LEADERBOARD_METRICS.map((metricKey) => (
                  <th
                    key={metricKey}
                    className={`metric-column metric-column-${metricKey}`}
                    scope="col"
                  >
                    <MetricHeader
                      metricKey={metricKey}
                      sort={sort}
                      onSort={handleSort}
                      copy={copy}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleModels.map((model) => {
                const rank = ranks.get(model.model) ?? null;
                const modelNameLines = splitModelLabel(formatLeaderboardModelName(model.model));
                return (
                  <tr key={model.model} className="leader-row">
                    <td className="rank-column rank-value">
                      {rank !== null && rank <= 3 ? (
                        <span className={`rank-medal rank-${rank}`}>{rank}</span>
                      ) : (
                        rank ?? "—"
                      )}
                    </td>
                    <th className="model-column model-name" scope="row" data-testid="model-name">
                      <span className="model-name-lines">
                        {modelNameLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    </th>
                    {LEADERBOARD_METRICS.map((metricKey) => {
                      const metric = METRIC_BY_KEY[metricKey];
                      const value = model.bcpLink?.[metric.key] ?? null;
                      const isPercentage = metric.format === "percent" && value !== null;
                      const cellStyle = isPercentage
                        ? ({
                            "--metric-fill": `${Math.max(0, Math.min(100, value))}%`,
                          } as CSSProperties)
                        : undefined;
                      const classNames = [
                        "metric-value-cell",
                        `metric-value-${metric.key}`,
                        isPercentage ? "percentage-data-bar" : "",
                        value === null ? "missing-value" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <td key={metric.key} className={classNames} style={cellStyle}>
                          <span>{formatMetricValue(metric.key, value, language)}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleModels.length === 0 && (
            <div className="table-empty">
              <Search aria-hidden="true" />
              <p>{copy.leaderboard.noMatches(query)}</p>
            </div>
          )}
        </div>
      </div>
      <div className="leaderboard-footer">
        <a
          className="download-csv"
          href={csvDownloadHref}
          download="bcp-link-results.csv"
          aria-label={copy.leaderboard.downloadCsvLabel}
        >
          <span>{copy.leaderboard.downloadCsv}</span>
        </a>
      </div>
    </div>
  );

  return (
    <section
      id="leaderboard"
      className="page-section leaderboard-section"
      aria-labelledby="leaderboard-heading"
    >
      <div className="container section-inner">
        <div className="section-heading">
          <p className="section-kicker">{copy.leaderboard.kicker}</p>
          <h2 id="leaderboard-heading">{copy.leaderboard.heading}</h2>
          <p className="section-note">{copy.leaderboard.note}</p>
        </div>

        {renderLeaderboardSurface()}
      </div>
    </section>
  );
}

function ComparisonModelPicker({
  availableModels,
  selectedModels,
  copy,
  onToggle,
  onToggleAll,
}: {
  availableModels: string[];
  selectedModels: string[];
  copy: Translation["comparison"];
  onToggle: (model: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const allSelected =
    availableModels.length > 0 && selectedModels.length === availableModels.length;
  const someSelected = selectedModels.length > 0 && !allSelected;

  return (
    <div className="comparison-model-picker" ref={rootRef}>
      <span className="comparison-control-label">{copy.modelsLabel}</span>
      <button
        ref={triggerRef}
        type="button"
        className="comparison-model-trigger"
        aria-label={copy.modelPickerLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <ListFilter aria-hidden="true" />
        <span>{copy.selectedModels(selectedModels.length)}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          className="comparison-model-menu"
          role="group"
          aria-label={copy.modelPickerLabel}
        >
          <label className="comparison-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={() => onToggleAll(!allSelected)}
            />
            <span>{copy.selectAllModels}</span>
            <small>{copy.selectedModels(selectedModels.length)}</small>
          </label>
          {availableModels.map((modelName) => {
            const checked = selectedModels.includes(modelName);
            return (
              <label key={modelName}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(modelName)}
                />
                <span>{formatModelDisplayName(modelName)}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ComparisonDatum {
  model: string;
  bcp: number;
  bcpLink: number;
}

function splitModelLabel(model: string): string[] {
  if (model.length <= 22) return [model];

  const parts = model.split("-");
  let firstLine = parts.shift() ?? model;
  while (parts.length > 0 && `${firstLine}-${parts[0]}`.length <= 22) {
    firstLine += `-${parts.shift()}`;
  }

  const remainder = parts.join("-");
  if (!remainder) return [model.slice(0, 21) + "…"];
  return [firstLine, remainder.length > 26 ? remainder.slice(0, 25) + "…" : remainder];
}

function ComparisonXAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const model = payload?.value ?? "";
  const displayName = formatModelDisplayName(model);
  const lines = splitModelLabel(displayName);

  return (
    <g className="comparison-axis-label" transform={`translate(${x},${y})`}>
      <title>{displayName}</title>
      <text textAnchor="middle">
        {lines.map((line, index) => (
          <tspan key={line} x="0" dy={index === 0 ? 20 : 18}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function formatComparisonDelta(
  metricKey: MetricKey,
  delta: number,
  language: Language,
  copy: Translation["comparison"],
): string {
  const metric = METRIC_BY_KEY[metricKey];
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const magnitude = Math.abs(delta);
  const formatted = new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    minimumFractionDigits: metric.fractionDigits,
    maximumFractionDigits: metric.fractionDigits,
  }).format(magnitude);

  return metric.format === "percent"
    ? `${sign}${formatted} ${copy.percentagePoints}`
    : `${sign}${formatted}`;
}

function ComparisonTooltip({
  active,
  payload,
  metricKey,
  language,
  copy,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ComparisonDatum }>;
  metricKey: MetricKey;
  language: Language;
  copy: Translation;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;

  return (
    <div className="comparison-tooltip" role="tooltip">
      <p className="comparison-tooltip-title">{formatModelDisplayName(datum.model)}</p>
      <dl>
        <div>
          <dt><span className="tooltip-swatch tooltip-swatch-bcp-link" />BCP-Link</dt>
          <dd>{formatMetricValue(metricKey, datum.bcpLink, language)}</dd>
        </div>
        <div>
          <dt><span className="tooltip-swatch tooltip-swatch-bcp" />BCP</dt>
          <dd>{formatMetricValue(metricKey, datum.bcp, language)}</dd>
        </div>
        <div className="tooltip-delta-row">
          <dt>{copy.comparison.deltaLabel}</dt>
          <dd>
            {formatComparisonDelta(
              metricKey,
              datum.bcpLink - datum.bcp,
              language,
              copy.comparison,
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ComparisonChart({
  models,
  language,
  copy,
}: {
  models: ModelResults[];
  language: Language;
  copy: Translation;
}) {
  const availableModelNames = useMemo(
    () =>
      [...models]
        .filter((model) => model.bcp !== null && model.bcpLink !== null)
        .sort((left, right) => {
          const accuracyDifference =
            (right.bcpLink?.accuracy ?? Number.NEGATIVE_INFINITY) -
            (left.bcpLink?.accuracy ?? Number.NEGATIVE_INFINITY);
          return accuracyDifference || left.model.localeCompare(right.model);
        })
        .map((model) => model.model),
    [models],
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("accuracy");
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    const preferred = availableModelNames.filter((modelName) =>
      DEFAULT_COMPARISON_MODEL_NAMES.includes(modelName as (typeof DEFAULT_COMPARISON_MODEL_NAMES)[number]),
    );
    return preferred.length > 0 ? preferred : availableModelNames.slice(0, 1);
  });
  const selectId = useId();
  const metricText = copy.metrics[selectedMetric];

  useEffect(() => {
    setSelectedModels((current) => {
      return current.filter((modelName) => availableModelNames.includes(modelName));
    });
  }, [availableModelNames]);

  const handleModelToggle = (modelName: string) => {
    setSelectedModels((current) => {
      const next = new Set(current);
      if (next.has(modelName)) {
        next.delete(modelName);
      } else {
        next.add(modelName);
      }
      return availableModelNames.filter((name) => next.has(name));
    });
  };

  const handleAllModelsToggle = (selectAll: boolean) => {
    setSelectedModels(selectAll ? availableModelNames : []);
  };

  const chartData = useMemo<ComparisonDatum[]>(() => {
    const modelsByName = new Map(models.map((model) => [model.model, model]));
    return availableModelNames.flatMap((modelName) => {
      if (!selectedModels.includes(modelName)) return [];
      const model = modelsByName.get(modelName);
      const bcp = model?.bcp?.[selectedMetric] ?? null;
      const bcpLink = model?.bcpLink?.[selectedMetric] ?? null;
      return bcp === null || bcpLink === null ? [] : [{ model: modelName, bcp, bcpLink }];
    });
  }, [availableModelNames, models, selectedMetric, selectedModels]);

  const chartDomain = getComparisonValuesDomain(
    chartData.flatMap((datum) => [datum.bcpLink, datum.bcp]),
  );
  const chartMinWidth = Math.max(720, chartData.length * 220);

  return (
    <section
      id="comparison"
      className="page-section comparison-section section-tinted"
      aria-labelledby="comparison-heading"
    >
      <div className="container section-inner">
        <div className="section-heading">
          <p className="section-kicker">{copy.comparison.kicker}</p>
          <h2 id="comparison-heading">{copy.comparison.heading}</h2>
          <p className="section-note">
            {copy.comparison.comparable(chartData.length, metricText.label)}
          </p>
        </div>

        <div className="comparison-workspace">
          <div className="comparison-controls">
            <div className="comparison-series-legend" aria-hidden="true">
              <span>
                <i className="series-swatch series-swatch-bcp-link" />
                BCP-Link
              </span>
              <span>
                <i className="series-swatch series-swatch-bcp" />
                BCP
              </span>
            </div>
            <div className="comparison-control-fields">
              <ComparisonModelPicker
                availableModels={availableModelNames}
                selectedModels={selectedModels}
                copy={copy.comparison}
                onToggle={handleModelToggle}
                onToggleAll={handleAllModelsToggle}
              />
              <div className="select-group">
                <label htmlFor={selectId}>{copy.comparison.metricLabel}</label>
                <div className="select-wrap">
                  <select
                    id={selectId}
                    aria-label={copy.comparison.selectLabel}
                    value={selectedMetric}
                    onChange={(event) => setSelectedMetric(event.target.value as MetricKey)}
                  >
                    {METRICS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {copy.metrics[option.key].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div
              className="chart-scroll"
              data-testid="comparison-chart"
              tabIndex={0}
              aria-label={copy.comparison.chartLabel(metricText.label)}
            >
              <div className="chart-canvas" style={{ minWidth: chartMinWidth }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    barGap={6}
                    barCategoryGap="20%"
                    margin={{ top: 18, right: 24, bottom: 66, left: 10 }}
                  >
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis
                      dataKey="model"
                      interval={0}
                      height={82}
                      tick={<ComparisonXAxisTick />}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-strong)" }}
                    />
                    <YAxis
                      domain={chartDomain}
                      allowDataOverflow={false}
                      tickCount={5}
                      width={72}
                      tick={{ fill: "var(--muted)", fontSize: 13 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) =>
                        formatMetricValue(selectedMetric, value, language)
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "var(--chart-cursor)" }}
                      content={
                        <ComparisonTooltip
                          metricKey={selectedMetric}
                          language={language}
                          copy={copy}
                        />
                      }
                    />
                    <Bar
                      className="chart-series-bcp-link"
                      dataKey="bcpLink"
                      name="BCP-Link"
                      fill="var(--chart-bcp-link)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      maxBarSize={48}
                      isAnimationActive={false}
                    />
                    <Bar
                      className="chart-series-bcp"
                      dataKey="bcp"
                      name="BCP"
                      fill="var(--chart-bcp)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      maxBarSize={48}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="chart-empty" role="status">
              <BarChart3 aria-hidden="true" />
              <h3>
                {selectedModels.length === 0
                  ? copy.comparison.emptySelectionHeading
                  : copy.comparison.emptyHeading(metricText.label)}
              </h3>
              <p>
                {selectedModels.length === 0
                  ? copy.comparison.emptySelectionBody
                  : copy.comparison.emptyBody}
              </p>
            </div>
          )}
        </div>

        <ol className="comparison-insights" aria-label={copy.comparison.insightsLabel}>
          <li>
            <span className="comparison-insight-index" aria-hidden="true">
              01
            </span>
            <p>
              {copy.comparison.trainedInsightBefore}
              <strong>{copy.comparison.trainedInsightEmphasis}</strong>
              {copy.comparison.trainedInsightAfter}
            </p>
          </li>
          <li>
            <span className="comparison-insight-index" aria-hidden="true">
              02
            </span>
            <p>{copy.comparison.untrainedInsight}</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function MetricGuide({ copy }: { copy: Translation }) {
  const [previewMetric, setPreviewMetric] = useState<MetricKey | null>(null);
  const [pinnedMetric, setPinnedMetric] = useState<MetricKey | null>(null);
  const metricButtonRefs = useRef<Partial<Record<MetricKey, HTMLButtonElement | null>>>({});
  const activeMetric = pinnedMetric ?? previewMetric;
  useEffect(() => {
    if (!pinnedMetric) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const trigger = metricButtonRefs.current[pinnedMetric];
      const popover = document.getElementById(`metric-detail-${pinnedMetric}`);
      if (trigger?.contains(target) || popover?.contains(target)) return;
      setPinnedMetric(null);
      setPreviewMetric(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const metricKey = pinnedMetric;
      setPinnedMetric(null);
      setPreviewMetric(null);
      metricButtonRefs.current[metricKey]?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pinnedMetric]);

  return (
    <section
      id="metrics"
      className="page-section metric-guide-section section-tinted"
      aria-labelledby="metrics-heading"
    >
      <div className="container section-inner">
        <div className="section-heading">
          <p className="section-kicker">{copy.metricGuide.kicker}</p>
          <h2 id="metrics-heading">{copy.metricGuide.heading}</h2>
          <p className="section-note">{copy.metricGuide.note}</p>
        </div>
        <div className="metric-guide-grid">
          {METRIC_GUIDE_METRICS.map((metric, index) => {
            const metricKey = metric.key;
            const categoryKey = METRIC_CATEGORY_BY_KEY[metricKey];
            const metricCopy = copy.metrics[metricKey];
            const isActive = activeMetric === metricKey;
            const isPinned = pinnedMetric === metricKey;
            return (
              <article
                key={metricKey}
                className="metric-card"
                data-active={isActive ? "true" : "false"}
                data-pinned={isPinned ? "true" : "false"}
                data-popover-placement={index < 3 ? "bottom" : "top"}
                onMouseEnter={() => setPreviewMetric(metricKey)}
                onMouseLeave={() => setPreviewMetric(null)}
              >
                <button
                  ref={(element) => {
                    metricButtonRefs.current[metricKey] = element;
                  }}
                  type="button"
                  className="metric-card-trigger"
                  aria-expanded={isActive}
                  aria-controls={`metric-detail-${metricKey}`}
                  aria-label={
                    isPinned
                      ? copy.metricGuide.unpinMetricDetails(metricCopy.label)
                      : copy.metricGuide.openMetricDetails(metricCopy.label)
                  }
                  onFocus={() => setPreviewMetric(metricKey)}
                  onBlur={() => {
                    if (!isPinned) setPreviewMetric(null);
                  }}
                  onClick={() => {
                    setPinnedMetric((current) => (current === metricKey ? null : metricKey));
                  }}
                >
                  <span className="metric-card-topline">
                    <small>
                      {metric.format === "percent"
                        ? copy.metricGuide.percentage
                        : copy.metricGuide.averageCount}
                    </small>
                    <span className={`metric-card-category metric-card-category-${categoryKey}`}>
                      {copy.metricGuide.groups[categoryKey]}
                    </span>
                  </span>
                  <span className="metric-card-copy">
                    <strong>{metricCopy.label}</strong>
                    <span className="metric-card-summary">{metricCopy.definition}</span>
                  </span>
                </button>
                {isActive && (
                  <div
                    id={`metric-detail-${metricKey}`}
                    className="metric-detail-popover"
                    role={isPinned ? "region" : "tooltip"}
                    aria-label={`${metricCopy.label}: ${metricCopy.definition}`}
                  >
                    <div className="metric-detail-heading">
                      <strong>{metricCopy.label}</strong>
                      {isPinned && (
                        <span className="metric-pinned-status">
                          <Pin aria-hidden="true" /> {copy.metricGuide.pinnedStatus}
                        </span>
                      )}
                    </div>
                    <dl>
                      <div>
                        <dt>{copy.metricGuide.definitionLabel}</dt>
                        <dd>{metricCopy.definition}</dd>
                      </div>
                      <div>
                        <dt>{copy.metricGuide.calculationLabel}</dt>
                        <dd>{metricCopy.calculation}</dd>
                      </div>
                      <div>
                        <dt>{copy.metricGuide.interpretationLabel}</dt>
                        <dd>{metricCopy.interpretation}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <p className="metric-footnote">{copy.metricGuide.footnote}</p>
      </div>
    </section>
  );
}

function SiteFooter({ copy }: { copy: Translation }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-mark" aria-hidden="true"><Link2 /></span>
          <div>
            <strong>BCP-Link</strong>
            <p>{copy.footer.description}</p>
          </div>
        </div>
        <nav className="footer-nav" aria-label={copy.footer.navigationLabel}>
          <a href="#leaderboard" aria-label={copy.footer.leaderboardLabel}>
            {copy.nav.leaderboard}
          </a>
          <a href="#comparison" aria-label={copy.footer.comparisonLabel}>
            {copy.nav.comparison}
          </a>
          <a href="#rules" aria-label={copy.footer.rulesLabel}>
            {copy.nav.rules}
          </a>
        </nav>
        <div className="footer-end">
          <a className="back-to-top" href="#top">
            {copy.footer.backToTop} <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function ErrorState({ message, copy }: { message: string; copy: Translation }) {
  return (
    <main className="page-main error-main">
      <div className="container">
        <div className="error-state" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <h2>{copy.errors.heading}</h2>
            <p>{message}</p>
            <code>data/bcp-link-results.csv</code>
          </div>
        </div>
      </div>
    </main>
  );
}

export function LeaderboardApp({ csvText = resultsCsv }: LeaderboardAppProps) {
  const [language, setLanguage] = useState<Language>(resolveInitialLanguage);
  const [theme, setTheme] = useState<ThemeKey>(resolveInitialTheme);
  const copy = TRANSLATIONS[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = copy.pageTitle;
  }, [copy.pageTitle, language]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const parsed = useMemo(() => {
    try {
      return { models: parseBenchmarkCsv(csvText), error: null };
    } catch (error) {
      return {
        models: [],
        error: error instanceof Error ? error.message : copy.errors.unknown,
      };
    }
  }, [copy.errors.unknown, csvText]);

  return (
    <div id="top" className="app-shell">
      <header className="site-header">
        <div className="container nav-inner">
          <a className="brand-block" href="#top" aria-label={copy.nav.home}>
            <span className="brand-mark" aria-hidden="true">
              <img src={brandLogoDark} alt="" />
            </span>
            <span className="brand-title">BCP-Link Leaderboard</span>
          </a>
          <div className="header-actions">
            <PrimaryNavigation copy={copy} />
            <div className="header-controls">
              <ThemePicker
                theme={theme}
                language={language}
                copy={copy}
                onChange={setTheme}
              />
              <LanguageSwitch language={language} copy={copy} onChange={setLanguage} />
            </div>
          </div>
        </div>
      </header>

      {parsed.error ? (
        <ErrorState message={parsed.error} copy={copy} />
      ) : (
        <main className="page-main">
          <section
            id="about"
            className="page-section benchmark-intro"
            aria-labelledby="about-heading"
          >
            <div className="container intro-inner">
              <div className="intro-heading">
                <h1 id="about-heading">{copy.intro.heading}</h1>
                {copy.intro.subtitle && <p className="intro-subtitle">{copy.intro.subtitle}</p>}
              </div>
              <div className="intro-body">
                <p className="intro-description">
                  <strong>BrowseComp-Plus-Link (BCP-Link)</strong>{copy.intro.descriptionBeforeLink}
                  <a
                    className="intro-dataset-link"
                    href={BROWSECOMP_PLUS_PAPER_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    BrowseComp-Plus
                  </a>
                  {renderInlineCode(copy.intro.descriptionAfterLink)}
                </p>
                <div className="intro-release">
                  <h2>{copy.intro.releaseHeading}</h2>
                  <ul className="intro-release-list">
                    {copy.intro.releaseItems.map((item) => (
                      <li key={`${item.value}-${item.label}`}>
                        <strong>{item.value}</strong>
                        {" "}
                        <span>{renderInlineCode(item.label)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="intro-actions">
                  <a className="intro-action intro-action-primary" href="#leaderboard">
                    {copy.intro.rankingsAction} <ArrowDownRight aria-hidden="true" />
                  </a>
                  <a className="intro-action intro-action-secondary" href="#rules">
                    {copy.intro.protocolAction} <ArrowRight aria-hidden="true" />
                  </a>
                  <a
                    className="intro-action intro-action-resource"
                    href={CODE_RELEASE_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={copy.intro.codeActionLabel}
                  >
                    <Github aria-hidden="true" /> <span>{copy.intro.codeAction}</span>
                  </a>
                  <a
                    className="intro-action intro-action-resource"
                    href={DATASET_RELEASE_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={copy.intro.datasetActionLabel}
                  >
                    <Database aria-hidden="true" /> <span>{copy.intro.datasetAction}</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
          <LeaderboardTable
            models={parsed.models}
            language={language}
            copy={copy}
          />
          <ComparisonChart models={parsed.models} language={language} copy={copy} />
          <EvaluationRules copy={copy} />
          <MetricGuide copy={copy} />
        </main>
      )}
      <SiteFooter copy={copy} />
    </div>
  );
}

export default LeaderboardApp;
