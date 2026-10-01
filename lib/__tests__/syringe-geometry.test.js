import { B_RIGHT, B_W, B_X, SW, stopperX, unitsAtX, vialLevel } from "../syringe-geometry";

describe("stopperX", () => {
  test("an empty syringe has the stopper at the needle end", () => {
    expect(stopperX(0)).toBe(B_RIGHT);
  });

  test("a full syringe has the stopper at the far end of the barrel", () => {
    expect(stopperX(100)).toBe(B_X);
    expect(stopperX(50, 50)).toBe(B_X);
  });

  test("half way is half the barrel", () => {
    expect(stopperX(50)).toBe(B_RIGHT - B_W / 2);
    expect(stopperX(20, 40)).toBe(B_RIGHT - B_W / 2);
  });

  test("a draw past the barrel stops at the barrel", () => {
    expect(stopperX(140)).toBe(B_X);
    expect(stopperX(-5)).toBe(B_RIGHT);
  });
});

describe("unitsAtX", () => {
  // The picture is drawn at its viewBox width here, so pixels equal units of
  // the viewBox and the two functions can be compared directly.
  test("is the inverse of stopperX", () => {
    for (const units of [0, 1, 10, 37, 50, 99, 100]) {
      expect(unitsAtX(stopperX(units), SW)).toBe(units);
    }
    for (const units of [0, 8, 20, 40]) {
      expect(unitsAtX(stopperX(units, 40), SW, 40)).toBe(units);
    }
  });

  test("scales with the rendered width", () => {
    expect(unitsAtX(stopperX(25) * 2, SW * 2)).toBe(25);
    expect(unitsAtX(stopperX(25) / 2, SW / 2)).toBe(25);
  });

  test("stays inside the barrel", () => {
    expect(unitsAtX(0, SW)).toBe(100);
    expect(unitsAtX(SW, SW)).toBe(0);
    expect(unitsAtX(-50, SW, 50)).toBe(50);
  });

  test("gives 0 before the picture has been measured", () => {
    expect(unitsAtX(120, 0)).toBe(0);
  });
});

describe("vialLevel", () => {
  test("no water, no level", () => {
    expect(vialLevel(0)).toBe(0);
    expect(vialLevel(null)).toBe(0);
    expect(vialLevel(-1)).toBe(0);
  });

  test("never draws the vial brim-full", () => {
    for (const ml of [0.5, 1, 2, 3, 5, 10, 25]) {
      expect(vialLevel(ml)).toBeGreaterThan(0);
      expect(vialLevel(ml)).toBeLessThanOrEqual(0.92);
    }
  });

  test("more water in the same size of vial sits higher", () => {
    expect(vialLevel(2)).toBeGreaterThan(vialLevel(1));
    expect(vialLevel(3)).toBeGreaterThan(vialLevel(2));
    expect(vialLevel(5)).toBeGreaterThan(vialLevel(4));
  });
});
