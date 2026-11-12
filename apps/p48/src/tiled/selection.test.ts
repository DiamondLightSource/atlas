import { findField } from "./selection";

const lines = JSON.stringify(
  {
    start: {
      scan_id: 7,
      detectors: ["det1", "det2"],
      motors: [],
      plan_args: { num: 3 },
      scan: "not start.scan_id",
    },
    stop: { exit_status: "success" },
  },
  null,
  2,
).split("\n");

describe("findField", () => {
  it("finds a nested value on one line", () => {
    const [first, last] = findField(lines, ["start", "scan_id"])!;

    expect(first).toBe(last);
    expect(lines[first]).toBe('    "scan_id": 7,');
  });

  it("finds all the lines of an array", () => {
    const [first, last] = findField(lines, ["start", "detectors"])!;

    expect(lines.slice(first, last + 1)).toEqual([
      '    "detectors": [',
      '      "det1",',
      '      "det2"',
      "    ],",
    ]);
  });

  it("finds all the lines of an object", () => {
    const [first, last] = findField(lines, ["start", "plan_args"])!;

    expect(lines.slice(first, last + 1)).toEqual([
      '    "plan_args": {',
      '      "num": 3',
      "    },",
    ]);
  });

  it("finds an empty array on one line", () => {
    const [first, last] = findField(lines, ["start", "motors"])!;

    expect(first).toBe(last);
    expect(lines[first]).toBe('    "motors": [],');
  });

  it("only looks within the parent key", () => {
    const [first] = findField(lines, ["stop", "exit_status"])!;

    expect(lines[first]).toBe('    "exit_status": "success"');
  });

  it("returns null for a missing key", () => {
    expect(findField(lines, ["start", "num_points"])).toBeNull();
    expect(findField(lines, ["nope", "scan_id"])).toBeNull();
  });
});
