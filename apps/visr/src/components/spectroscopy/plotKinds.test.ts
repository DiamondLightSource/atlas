import { beamWarning } from "./plotKinds";

describe("beamWarning", () => {
  const step = { x: 0.25, y: 0.25, source: "scan step" } as const;

  it("warns when the beam is only the scan step, for the beam-sized drawings", () => {
    expect(beamWarning("ovals", step)).toContain("0.25 × 0.25");
    expect(beamWarning("gaussian", step)).toContain(
      "not the real beamline footprint",
    );
  });

  it("says nothing when the run records its beam size", () => {
    expect(
      beamWarning("ovals", { x: 0.1, y: 0.2, source: "metadata" }),
    ).toBeNull();
  });

  it("says nothing for drawings that don't use the beam", () => {
    expect(beamWarning("cells", step)).toBeNull();
    expect(beamWarning("rectangles", step)).toBeNull();
    expect(beamWarning("ovals")).toBeNull();
  });
});
