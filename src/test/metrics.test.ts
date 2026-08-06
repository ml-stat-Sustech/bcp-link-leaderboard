import { describe, expect, it } from "vitest";
import { formatMetricValue } from "../metrics";

describe("formatMetricValue", () => {
  it("uses a consistent precision for every metric", () => {
    expect(formatMetricValue("accuracy", 25.545)).toBe("25.55%");
    expect(formatMetricValue("recall", 9.7)).toBe("9.70%");
    expect(formatMetricValue("searchCalls", 12.3)).toBe("12.30");
    expect(formatMetricValue("visitCalls", 3.783)).toBe("3.78");
    expect(formatMetricValue("linkFollowingVisitCalls", 0.072)).toBe("0.0720");
    expect(formatMetricValue("turns", 5.94)).toBe("5.94");
  });

  it("preserves the missing-value marker", () => {
    expect(formatMetricValue("accuracy", null)).toBe("—");
  });
});
