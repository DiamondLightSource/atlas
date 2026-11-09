import { DataSource } from "./dataSource";
import type { Beam, PlotKind } from "./useSpectroscopyData";

/** Where the points are drawn: the scan's setpoint grid, or where the motors read back */
export type Positions = "setpoints" | "readbacks";

/** How each point is drawn at its readback position */
export type Shape = Exclude<PlotKind, "cells">;

export const DATA_SOURCES: {
  value: DataSource;
  label: string;
  help: string;
}[] = [
  {
    value: DataSource.Camera,
    label: "Camera",
    help: "Data taken from regions of interest on the camera image",
  },
  {
    value: DataSource.Diodes,
    label: "Diodes",
    help: "Data taken from diodes placed along the diffracted spectrum",
  },
];

export const POSITIONS: { value: Positions; label: string; help: string }[] = [
  {
    value: "setpoints",
    label: "Setpoints",
    help: "Each point at the position the scan planned to collect data at. Where several points fall in the same grid square, they are averaged",
  },
  {
    value: "readbacks",
    label: "Readbacks",
    help: "Each point at the position the motors collected data at",
  },
];

export const SHAPES: { value: Shape; label: string; help: string }[] = [
  {
    value: "rectangles",
    label: "Rectangles",
    help: "A rectangle which is step-size by step-size. For 'Setpoints' positions this is the raw data at each point, for 'Readbacks' positions this is the interpolated data at each point",
  },
  {
    value: "gaussian",
    label: "Gaussian",
    help: "A representation of the interpolated data. For 'Readbacks' positions this is the interpolated data (interpolated using a gaussian footprint) at each point",
  },
  {
    value: "ovals",
    label: "Footprints",
    help: "A representation of the interpolated data. For 'Readbacks' positions this is the interpolated data (interpolated using the footprint of the beam) at each point",
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
    `one scan step (${size(beam.x)} × ${size(beam.y)}), not the real beam footprint.`
  );
}
