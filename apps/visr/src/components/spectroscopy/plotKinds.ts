import type { Beam, PlotKind } from "./useSpectroscopyData";

/** The ways a scan can be drawn, with what each shows */
export const PLOT_KINDS: { kind: PlotKind; label: string; help: string }[] = [
  {
    kind: "cells",
    label: "Setpoint grid",
    help: "The grid of the scan's setpoints (from its spec), each cell the mean of the points in it",
  },
  {
    kind: "rectangles",
    label: "Readbacks",
    help: "A step-sized rectangle at each position the motors actually read back",
  },
  {
    kind: "gaussian",
    label: "Gaussian",
    help: "A beam-sized Gaussian on each point: gaps the beam didn't cover show",
  },
  {
    kind: "ovals",
    label: "Footprints",
    help: "Each point's beam footprint, overlaps split between neighbours",
  },
];

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
