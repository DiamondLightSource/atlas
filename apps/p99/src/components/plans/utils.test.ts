import { getStatusColor } from "./utils";

describe("getStatusColor", () => {
  it("returns the correct colour for running", () => {
    expect(getStatusColor("RUNNING")).toEqual({
      bg: "#e8f5e9",
      text: "#2e7d32",
      border: "#a5d6a7",
    });
  });
  it("returns the correct colour for idle", () => {
    expect(getStatusColor("IDLE")).toEqual({
      bg: "#e3f2fd",
      text: "#1565c0",
      border: "#90caf9",
    });
  });
  it("returns the correct colour for paused", () => {
    expect(getStatusColor("PAUSED")).toEqual({
      bg: "#fff3e0",
      text: "#ef6c00",
      border: "#ffcc80",
    });
  });
  it("returns the correct colour for panicked", () => {
    expect(getStatusColor("PANICKED")).toEqual({
      bg: "#ffebee",
      text: "#c62828",
      border: "#ef9a9a",
    });
  });
  it("returns the correct colour for aborting", () => {
    expect(getStatusColor("ABORTING")).toEqual({
      bg: "#ffebee",
      text: "#c62828",
      border: "#ef9a9a",
    });
  });
  it("returns the correct colour for pausing", () => {
    expect(getStatusColor("PAUSING")).toEqual({
      bg: "#f5f5f5",
      text: "#616161",
      border: "#e0e0e0",
    });
  });
  it("returns the correct colour for halting", () => {
    expect(getStatusColor("HALTING")).toEqual({
      bg: "#f5f5f5",
      text: "#616161",
      border: "#e0e0e0",
    });
  });
  it("returns the correct colour for unknown", () => {
    expect(getStatusColor("UNKNOWN")).toEqual({
      bg: "#f5f5f5",
      text: "#616161",
      border: "#e0e0e0",
    });
  });
});
