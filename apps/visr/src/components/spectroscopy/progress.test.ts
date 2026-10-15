import { describeOffset, describeProgress, percentDone } from "./progress";

const progress = (nPoints: number, nTotal: number | null, offset = null) => ({
  nPoints,
  nTotal,
  offset,
});

describe("progress", () => {
  it("counts the points against the scan's total", () => {
    expect(percentDone(progress(50, 200))).toBe(25);
    expect(describeProgress(progress(50, 200))).toBe("50 of 200 points");
  });

  it("has no percentage without a total", () => {
    expect(percentDone(progress(1, null))).toBe(null);
    expect(describeProgress(progress(1, null))).toBe("1 point");
  });

  it("mentions a shift onto the grid only when there is one", () => {
    expect(describeOffset(progress(1, 1))).toBe(null);
    expect(
      describeOffset({ nPoints: 1, nTotal: 1, offset: { x: 0.05, y: 0 } }),
    ).toBe("Readbacks shifted by (0.05, 0) onto the setpoint grid");
  });
});
