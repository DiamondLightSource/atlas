import type { Beam, PlotKind } from "./useSpectroscopyData";

/** Where the points are drawn: the scan's setpoint grid, or where the motors read back */
export type Positions = "setpoints" | "readbacks";

/** How each point is drawn at its readback position */
export type Shape = Exclude<PlotKind, "cells">;

export const POSITIONS: { value: Positions; label: string; help: string }[] = [
  {
    value: "setpoints",
    label: "Setpoints",
    help: "The grid of the scan's setpoints (from its spec), each cell the mean of the points read back in it",
  },
  {
    value: "readbacks",
    label: "Readbacks",
    help: "Each point at the position the motors actually read back",
  },
];

export const SHAPES: { value: Shape; label: string; help: string }[] = [
  {
    value: "rectangles",
    label: "Rectangles",
    help: "A step-sized rectangle on each point",
  },
  {
    value: "gaussian",
    label: "Gaussian",
    help: "A beam-sized Gaussian on each point: gaps the beam didn't cover show",
  },
  {
    value: "ovals",
    label: "Footprints",
    help: "Each point's beam footprint, overlaps split between neighbours",
  },
];

/** Why Gaussian and footprints can't be picked on the setpoint grid */
export const READBACK_ONLY_HELP = "Drawn at the readback positions only";

/** The drawing for a choice of positions and shape */
export function plotKindFor(positions: Positions, shape: Shape): PlotKind {
  return positions === "setpoints" ? "cells" : shape;
}

/** Say so when the beam size isn't the beamline's: the run didn't record one */
export function beamWarning(kind: PlotKind, beam?: Beam): string | null {
  if (
    (kind !== "gaussian" && kind !== "ovals") ||
    beam?.source !== "scan step"
  ) {
    return null;
  }
  const size = (v: number) => Number(v.toPrecision(3));
  return (
    `This run doesn't record its beam size, so this is drawn with a beam of ` +
    `one scan step (${size(beam.x)} × ${size(beam.y)}), not the real beamline footprint.`
  );
}
