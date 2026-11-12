import { summariseRun } from "./runSummary";

describe("summariseRun", () => {
  it("reads a finished run", () => {
    expect(
      summariseRun({
        start: {
          scan_id: 7,
          plan_name: "scan",
          time: 1_700_000_000,
          detectors: ["det1", "det2"],
          motors: ["sample_x"],
          num_points: 20,
        },
        stop: { exit_status: "success", time: 1_700_000_010 },
      }),
    ).toEqual({
      scanId: "7",
      planName: "scan",
      startTime: 1_700_000_000,
      stopTime: 1_700_000_010,
      finished: true,
      exitStatus: "success",
      detectors: 2,
      motors: 1,
      numPoints: 20,
    });
  });

  it("treats a run without a stop document as unfinished", () => {
    expect(summariseRun({ start: { scan_id: 1 } }).finished).toBe(false);
  });

  it.each([
    ["no metadata", null],
    ["metadata that isn't an object", "nonsense"],
    ["no start document", {}],
    ["a start document that isn't an object", { start: ["scan"] }],
    ["an empty start document", { start: {} }],
  ])("leaves everything unknown for %s", (_, metadata) => {
    expect(summariseRun(metadata)).toEqual({ finished: false });
  });

  it("leaves values of unexpected types unknown", () => {
    expect(
      summariseRun({
        start: {
          scan_id: null,
          plan_name: { name: "scan" },
          time: "yesterday",
          detectors: "det1",
          motors: { x: 1 },
          num_points: NaN,
        },
        stop: { exit_status: false, time: "later" },
      }),
    ).toEqual({ finished: true });
  });
});
