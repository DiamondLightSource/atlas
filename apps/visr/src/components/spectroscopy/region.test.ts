import type { SelectionBase } from "@diamondlightsource/davidia";
import { describeRegion, selectionToRegion } from "./region";

/** A drawn rectangle from (x, y), w across and h up (either may be negative) */
function rectangle(x: number, y: number, w: number, h: number) {
  const corners = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return {
    getPoints: () => corners.map(([x, y]) => ({ x, y, z: 0 })),
  } as unknown as SelectionBase;
}

describe("selectionToRegion", () => {
  it("covers the rectangle drawn, whichever corner it was started from", () => {
    expect(selectionToRegion(rectangle(2, 5, -1.5, 2))).toEqual({
      x0: 0.5,
      x1: 2,
      y0: 5,
      y1: 7,
    });
  });

  it("ignores a rectangle with no area", () => {
    expect(selectionToRegion(rectangle(2, 5, 0, 2))).toBe(null);
  });
});

describe("describeRegion", () => {
  it("rounds to 3 significant figures", () => {
    expect(describeRegion({ x0: 0.12345, x1: 2, y0: -1, y1: 10.006 })).toBe(
      "x 0.123 to 2, y -1 to 10",
    );
  });
});
