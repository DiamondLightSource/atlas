import type { SelectionBase } from "@diamondlightsource/davidia";
import type { Region } from "./useSpectroscopyData";

/** The region a selection drawn on a plot covers (its bounding box), or null if it has no area */
export function selectionToRegion(selection: SelectionBase): Region | null {
  const points = selection.getPoints();
  if (!points.length) return null;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const region = {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
  if (![region.x0, region.x1, region.y0, region.y1].every(Number.isFinite)) {
    return null;
  }
  return region.x1 > region.x0 && region.y1 > region.y0 ? region : null;
}

/** A region as "x a to b, y c to d", to 3 significant figures */
export function describeRegion({ x0, x1, y0, y1 }: Region): string {
  const n = (v: number) => Number(v.toPrecision(3));
  return `x ${n(x0)} to ${n(x1)}, y ${n(y0)} to ${n(y1)}`;
}
