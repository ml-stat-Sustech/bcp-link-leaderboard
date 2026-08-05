import { describe, expect, it } from "vitest";
import { getAccuracyRanks, parseBenchmarkCsv } from "../data";

const CSV = `\uFEFFModel,benchmark,Metrics,,,,,,备注
,,Accuracy,Recall,Search Calls,Visit Calls,Link-following Visit Calls,Turns number,运行脚本路径
Alpha,bcp-link,62.65%,60.11%,30.78,2.69,0.075,25.79,
,bcp,57.59%,58.74%,30.59,7.23,0,38.85,
Beta,bcp-link,62.65%,,not-used,1.04,0.0012,4.79,
,bcp,23.82%,9.85%,3.55,0.89,0,5.41,
`;

describe("parseBenchmarkCsv", () => {
  it("handles the BOM, two headers, inherited model names, percentages, and nulls", () => {
    const source = CSV.replace("not-used", "2.77");
    const models = parseBenchmarkCsv(source);

    expect(models).toHaveLength(2);
    expect(models[0].model).toBe("Alpha");
    expect(models[0].bcpLink?.accuracy).toBe(62.65);
    expect(models[0].bcp?.model).toBe("Alpha");
    expect(models[0].bcp?.linkFollowingVisitCalls).toBe(0);
    expect(models[1].bcpLink?.recall).toBeNull();
  });

  it("rejects invalid non-empty metric values", () => {
    expect(() => parseBenchmarkCsv(CSV)).toThrow(/invalid number/);
  });

  it("preserves tied accuracy ranks", () => {
    const models = parseBenchmarkCsv(CSV.replace("not-used", "2.77"));
    const ranks = getAccuracyRanks(models);
    expect(ranks.get("Alpha")).toBe(1);
    expect(ranks.get("Beta")).toBe(1);
  });
});
