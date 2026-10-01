import { amountFromMcg, formatDoseFromMcg, trimNum } from "../format";

describe("trimNum", () => {
  test("drops padding zeros but keeps the number", () => {
    expect(trimNum(5, 2)).toBe("5");
    expect(trimNum(0.25, 3)).toBe("0.25");
    expect(trimNum(12.5, 1)).toBe("12.5");
    expect(trimNum(12.04, 1)).toBe("12");
  });

  test("keeps the zeros of a whole number", () => {
    expect(trimNum(100, 0)).toBe("100");
    expect(trimNum(100, 1)).toBe("100");
    expect(trimNum(20, 0)).toBe("20");
  });

  test("gives nothing for something that is not a number", () => {
    expect(trimNum(null)).toBe("");
    expect(trimNum(undefined)).toBe("");
    expect(trimNum(NaN)).toBe("");
    expect(trimNum(Infinity)).toBe("");
  });
});

describe("amountFromMcg", () => {
  test("micrograms stay micrograms", () => {
    expect(amountFromMcg(250, "mcg")).toBe("250");
    expect(amountFromMcg(925.04, "mcg")).toBe("925");
    expect(amountFromMcg(2.5, "mcg")).toBe("2.5");
  });

  test("milligrams are a thousandth", () => {
    expect(amountFromMcg(250, "mg")).toBe("0.25");
    expect(amountFromMcg(5000, "mg")).toBe("5");
  });

  test("IU needs the conversion factor, and falls back to mcg without one", () => {
    expect(amountFromMcg(1000, "IU", 3)).toBe("3");
    expect(amountFromMcg(1000, "IU", null)).toBe("1000");
  });

  test("gives nothing for a missing amount", () => {
    expect(amountFromMcg(null, "mcg")).toBe("");
    expect(amountFromMcg(NaN, "mg")).toBe("");
  });

  test("agrees with the labelled form used elsewhere", () => {
    expect(`${amountFromMcg(250, "mcg")} mcg`).toBe(formatDoseFromMcg(250, "mcg"));
    expect(`${amountFromMcg(5000, "mg")} mg`).toBe(formatDoseFromMcg(5000, "mg"));
  });
});
