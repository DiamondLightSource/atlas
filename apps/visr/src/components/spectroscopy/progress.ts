import type { Progress } from "./useSpectroscopyData";

/** How far the scan has got, in percent, or null if its size isn't known */
export function percentDone({ nPoints, nTotal }: Progress): number | null {
  if (!nTotal) return null;
  return Math.min(100, (100 * nPoints) / nTotal);
}

/** "120 of 289 points", or "120 points" without a known total */
export function describeProgress({ nPoints, nTotal }: Progress): string {
  const points = (n: number) => `${n} point${n === 1 ? "" : "s"}`;
  return nTotal ? `${nPoints} of ${points(nTotal)}` : points(nPoints);
}

/** Says how far the readbacks were shifted onto the setpoint grid, if they were */
export function describeOffset({ offset }: Progress): string | null {
  if (!offset || (offset.x === 0 && offset.y === 0)) return null;
  const n = (v: number) => Number(v.toPrecision(3));
  return `Readbacks shifted by (${n(offset.x)}, ${n(offset.y)}) onto the setpoint grid`;
}
