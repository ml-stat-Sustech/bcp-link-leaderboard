export type ThemeKey =
  | "research-blue"
  | "sage-gold"
  | "teal-amber"
  | "warm-neutral"
  | "charcoal-amber";

export interface ThemeOption {
  key: ThemeKey;
  name: {
    en: string;
    zh: string;
  };
  colors: readonly [string, string, string, string];
}

export const THEME_STORAGE_KEY = "bcp-link-theme";
export const DEFAULT_THEME: ThemeKey = "research-blue";

export const THEMES: readonly ThemeOption[] = [
  {
    key: "research-blue",
    name: { en: "Research Blue", zh: "研究蓝" },
    colors: ["#F9F7F7", "#DBE2EF", "#3F72AF", "#112D4E"],
  },
  {
    key: "sage-gold",
    name: { en: "Sage Gold", zh: "鼠尾草金" },
    colors: ["#8FA28A", "#C7D3C0", "#F7F4ED", "#C8A96B"],
  },
  {
    key: "teal-amber",
    name: { en: "Teal Amber", zh: "青绿琥珀" },
    colors: ["#224248", "#325E6A", "#44A1A4", "#FF9A00"],
  },
  {
    key: "warm-neutral",
    name: { en: "Warm Neutral", zh: "暖调中性" },
    colors: ["#F9F8F6", "#EFE9E3", "#D9CFC7", "#C9B59C"],
  },
  {
    key: "charcoal-amber",
    name: { en: "Charcoal Amber", zh: "炭灰琥珀" },
    colors: ["#222831", "#393E46", "#FFD369", "#EEEEEE"],
  },
];

export function resolveInitialTheme(): ThemeKey {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.some((theme) => theme.key === stored) ? (stored as ThemeKey) : DEFAULT_THEME;
}
