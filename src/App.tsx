import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  Database,
  GitCompareArrows,
  Info,
  Link2,
  ListFilter,
  Palette,
  Search,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import resultsCsv from "../data/bcp-link-results.csv?raw";
import { getAccuracyRanks, parseBenchmarkCsv } from "./data";
import { EvaluationRules } from "./EvaluationRules";
import {
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
  TRANSLATIONS,
  type Language,
  type Translation,
} from "./i18n";
import { formatMetricValue, getComparisonValuesDomain, METRICS } from "./metrics";
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

const COMPARISON_MODEL_NAMES = [
  "Tongyi-DeepResearch-30B-A3B",
  "SearchAgent-Zero",
  "WebExplorer-8B",
  "WebSailor-32B",
] as const;

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
      triggerRef.current?.focus();
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
                  triggerRef.current?.focus();
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
  const ranks = useMemo(() => getAccuracyRanks(models), [models]);

  const visibleModels = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return models
      .filter((model) => model.model.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => compareModels(a, b, sort));
  }, [models, query, sort]);

  const handleSort = (key: MetricKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <section id="leaderboard" className="content-section" aria-labelledby="leaderboard-heading">
      <div className="section-toolbar">
        <div>
          <p className="section-kicker">{copy.leaderboard.kicker}</p>
          <h2 id="leaderboard-heading">{copy.leaderboard.heading}</h2>
          <p className="section-note">{copy.leaderboard.note}</p>
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

      <div className="table-shell">
        <div className="table-scroll" tabIndex={0} aria-label={copy.leaderboard.tableScrollLabel}>
          <table>
            <thead>
              <tr>
                <th className="rank-column" scope="col">{copy.leaderboard.rank}</th>
                <th className="model-column" scope="col">{copy.leaderboard.model}</th>
                {METRICS.map((metric) => (
                  <th key={metric.key} scope="col">
                    <MetricHeader
                      metricKey={metric.key}
                      sort={sort}
                      onSort={handleSort}
                      copy={copy}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleModels.map((model) => (
                <tr key={model.model}>
                  <td className="rank-column rank-value">{ranks.get(model.model) ?? "—"}</td>
                  <th className="model-column model-name" scope="row" data-testid="model-name">
                    {model.model}
                  </th>
                  {METRICS.map((metric) => {
                    const value = model.bcpLink?.[metric.key] ?? null;
                    return (
                      <td key={metric.key} className={value === null ? "missing-value" : undefined}>
                        {formatMetricValue(metric.key, value, language)}
                      </td>
                    );
                  })}
                </tr>
              ))}
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
      <p className="results-count" aria-live="polite">
        {copy.leaderboard.showing(visibleModels.length, models.length)}
      </p>
    </section>
  );
}

function ComparisonModelPicker({
  selectedModels,
  copy,
  onToggle,
}: {
  selectedModels: string[];
  copy: Translation["comparison"];
  onToggle: (model: string) => void;
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
          {COMPARISON_MODEL_NAMES.map((modelName) => {
            const checked = selectedModels.includes(modelName);
            return (
              <label key={modelName}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={checked && selectedModels.length === 1}
                  onChange={() => onToggle(modelName)}
                />
                <span>{modelName}</span>
              </label>
            );
          })}
        </div>
      )}
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
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("accuracy");
  const [selectedModels, setSelectedModels] = useState<string[]>(() => [
    ...COMPARISON_MODEL_NAMES,
  ]);
  const selectId = useId();
  const metricText = copy.metrics[selectedMetric];

  const handleModelToggle = (modelName: string) => {
    setSelectedModels((current) => {
      const next = new Set(current);
      if (next.has(modelName)) {
        if (next.size === 1) return current;
        next.delete(modelName);
      } else {
        next.add(modelName);
      }
      return COMPARISON_MODEL_NAMES.filter((name) => next.has(name));
    });
  };

  const chartData = useMemo(() => {
    const modelsByName = new Map(models.map((model) => [model.model, model]));
    return COMPARISON_MODEL_NAMES.flatMap((modelName) => {
      if (!selectedModels.includes(modelName)) return [];
      const model = modelsByName.get(modelName);
      const bcp = model?.bcp?.[selectedMetric] ?? null;
      const bcpLink = model?.bcpLink?.[selectedMetric] ?? null;
      return bcp === null || bcpLink === null ? [] : [{ model: modelName, bcp, bcpLink }];
    });
  }, [models, selectedMetric, selectedModels]);

  const chartDomain = getComparisonValuesDomain(
    chartData.flatMap((datum) => [datum.bcpLink, datum.bcp]),
  );
  const chartMinWidth = Math.max(760, chartData.length * 240);

  return (
    <section id="comparison" className="content-section comparison-section" aria-labelledby="comparison-heading">
      <div className="section-toolbar comparison-toolbar">
        <div>
          <p className="section-kicker">{copy.comparison.kicker}</p>
          <h2 id="comparison-heading">{copy.comparison.heading}</h2>
          <p className="section-note">
            {copy.comparison.comparable(chartData.length, metricText.label)}
          </p>
        </div>
        <div className="comparison-controls">
          <ComparisonModelPicker
            selectedModels={selectedModels}
            copy={copy.comparison}
            onToggle={handleModelToggle}
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
        <div className="chart-shell" data-testid="comparison-chart">
          <div
            className="chart-scroll"
            tabIndex={0}
            aria-label={copy.comparison.chartLabel(metricText.label)}
          >
            <div className="chart-canvas" style={{ minWidth: chartMinWidth }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barGap={8}
                  barCategoryGap="38%"
                  margin={{ top: 20, right: 24, bottom: 78, left: 10 }}
                >
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="model"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={92}
                    tick={{ fill: "var(--text-subtle)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-strong)" }}
                  />
                  <YAxis
                    domain={chartDomain}
                    allowDataOverflow={false}
                    tickCount={5}
                    width={72}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      formatMetricValue(selectedMetric, value, language)
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "var(--chart-cursor)" }}
                    formatter={(value) =>
                      formatMetricValue(selectedMetric, Number(value), language)
                    }
                    contentStyle={{
                      border: "1px solid var(--border-strong)",
                      borderRadius: 6,
                      boxShadow: "0 8px 24px rgba(16, 24, 40, 0.10)",
                      color: "var(--text)",
                      background: "var(--surface)",
                    }}
                    labelStyle={{ fontWeight: 650, marginBottom: 8 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="square"
                    wrapperStyle={{ color: "var(--text-subtle)", fontSize: 13 }}
                  />
                  <Bar
                    className="chart-series-bcp-link"
                    dataKey="bcpLink"
                    name="BCP-Link"
                    fill="var(--chart-bcp-link)"
                    radius={[3, 3, 0, 0]}
                    barSize={40}
                    maxBarSize={48}
                    isAnimationActive={false}
                  />
                  <Bar
                    className="chart-series-bcp"
                    dataKey="bcp"
                    name="BCP"
                    fill="var(--chart-bcp)"
                    radius={[3, 3, 0, 0]}
                    barSize={40}
                    maxBarSize={48}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="chart-empty" role="status">
          <BarChart3 aria-hidden="true" />
          <h3>{copy.comparison.emptyHeading(metricText.label)}</h3>
          <p>{copy.comparison.emptyBody}</p>
        </div>
      )}
    </section>
  );
}

function MetricGuide({ copy }: { copy: Translation }) {
  return (
    <section id="metrics" className="content-section metric-guide-section" aria-labelledby="metrics-heading">
      <div className="section-toolbar">
        <div>
          <p className="section-kicker">{copy.metricGuide.kicker}</p>
          <h2 id="metrics-heading">{copy.metricGuide.heading}</h2>
          <p className="section-note">{copy.metricGuide.note}</p>
          <p className="metric-categories">{copy.metricGuide.categories}</p>
        </div>
      </div>
      <dl className="metric-guide">
        {METRICS.map((metric) => (
          <div key={metric.key} className="metric-definition">
            <dt>
              <span>{copy.metrics[metric.key].label}</span>
              <small>
                {metric.format === "percent"
                  ? copy.metricGuide.percentage
                  : copy.metricGuide.averageCount}
              </small>
            </dt>
            <dd>{copy.metrics[metric.key].definition}</dd>
          </div>
        ))}
      </dl>
      <p className="metric-footnote">{copy.metricGuide.footnote}</p>
    </section>
  );
}

function ErrorState({ message, copy }: { message: string; copy: Translation }) {
  return (
    <main className="page-main container">
      <div className="error-state" role="alert">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h2>{copy.errors.heading}</h2>
          <p>{message}</p>
          <code>data/bcp-link-results.csv</code>
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

  const comparableModels = parsed.models.filter(
    (model) =>
      model.bcp !== null &&
      model.bcpLink !== null &&
      METRICS.every(
        (metric) => model.bcp?.[metric.key] !== null && model.bcpLink?.[metric.key] !== null,
      ),
  ).length;

  return (
    <div id="top" className="app-shell">
      <header className="site-header">
        <div className="container nav-inner">
          <a className="brand-block" href="#top" aria-label={copy.nav.home}>
            <div className="brand-mark" aria-hidden="true">
              <Link2 />
            </div>
            <h1>BCP-Link Leaderboard</h1>
          </a>
          <div className="primary-actions">
            <nav className="primary-nav" aria-label="Primary navigation">
              <a href="#leaderboard">{copy.nav.leaderboard}</a>
              <a href="#rules">{copy.nav.rules}</a>
              <a href="#metrics">{copy.nav.metrics}</a>
            </nav>
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
        <main className="page-main container">
          <section id="about" className="benchmark-intro" aria-labelledby="about-heading">
            <h2 id="about-heading">{copy.intro.heading}</h2>
            <p className="intro-subtitle">{copy.intro.subtitle}</p>
            <div className="intro-body">
              <p>
                {copy.intro.bodyOneBeforeSearch}<code>search</code>
                {copy.intro.bodyOneBetweenTools}<code>visit</code>{copy.intro.bodyOneAfterVisit}
              </p>
              <p>{copy.intro.bodyTwo}</p>
            </div>
            <div className="dataset-stats" aria-label={copy.stats.label}>
              <div>
                <Database aria-hidden="true" />
                <span><strong>{parsed.models.length}</strong> {copy.stats.models(parsed.models.length).replace(`${parsed.models.length} `, "")}</span>
              </div>
              <div>
                <GitCompareArrows aria-hidden="true" />
                <span><strong>{comparableModels}</strong> {copy.stats.comparisons(comparableModels).replace(`${comparableModels} `, "")}</span>
              </div>
            </div>
          </section>
          <LeaderboardTable models={parsed.models} language={language} copy={copy} />
          <ComparisonChart models={parsed.models} language={language} copy={copy} />
          <EvaluationRules copy={copy} />
          <MetricGuide copy={copy} />
        </main>
      )}
    </div>
  );
}

export default LeaderboardApp;
