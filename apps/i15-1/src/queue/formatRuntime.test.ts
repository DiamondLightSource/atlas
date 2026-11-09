import { formatRuntime } from "./formatRuntime";

describe("formatRuntime", () => {
  it.each([
    [0, "0s"],
    [1, "1s"],
    [59, "59s"],
    [60, "1m"],
    [61, "1m 1s"],
    [90, "1m 30s"],
    [3599, "59m 59s"],
    [3600, "1h"],
    [3660, "1h 1m"],
    [3661, "1h 1m"],
    [86399, "23h 59m"],
    [86400, "1d"],
    [90000, "1d 1h"],
    [172800, "2d"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatRuntime(seconds)).toBe(expected);
  });
});
