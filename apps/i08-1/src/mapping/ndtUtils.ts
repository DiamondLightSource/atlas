import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";

type Matrix = (number | null)[][];

/** How the scan is drawn: /binned's cells, or one of /render's kinds */
export type PlotKind = "cells" | "rectangles" | "gaussian" | "ovals";

/**
 * Whether footprints are drawn with /render's white outlines; without them
 * the footprints meet edge to edge
 */
export const DRAW_OUTLINES = false;

/** Longest side, in pixels, of the images /render draws */
export const RENDER_SIZE = 200;

export type RGBColour = "red" | "green" | "blue" | "gray";

/**
 * Cells no point has landed in yet are drawn as the page's background crossed
 * by thin diagonal lines, which can't be mistaken for a measured value (dark
 * or not) and run on unbroken across the empty part of the scan. For lines
 * that thin, each of /binned's cells is drawn as several pixels square, so the
 * whole grid is at least MIN_IMAGE_PIXELS on its longer side (and at least
 * CELL_PIXELS per cell); the axes are split to match.
 */
export const CELL_PIXELS = 4;
export const MIN_IMAGE_PIXELS = 240;

/** Pixels between the empty cells' lines, along a row */
export const LINE_SPACING = 6;

/** Pixels per cell, on each axis, for a grid of width x height cells */
export function cellPixelsFor(width: number, height: number): number {
  return Math.max(
    CELL_PIXELS,
    Math.ceil(MIN_IMAGE_PIXELS / Math.max(width, height, 1)),
  );
}

/** An RGB colour, 0-255 each */
export type Rgb = readonly [number, number, number];

/** The empty cells' colours: the background, and its lines */
export type StripeColours = readonly [Rgb, Rgb];

/** How far the lines are from the background, 0-255 per channel */
export const STRIPE_CONTRAST = 48;

/**
 * The empty cells' colours on a background: the background itself, and thin
 * lines a shade darker on a light background, lighter on a dark one
 */
export function stripesOn(background: Rgb): StripeColours {
  const luminance =
    0.299 * background[0] + 0.587 * background[1] + 0.114 * background[2];
  const shift = luminance > 127 ? -STRIPE_CONTRAST : STRIPE_CONTRAST;
  const shifted = background.map(c =>
    Math.min(255, Math.max(0, c + shift)),
  ) as unknown as Rgb;
  return [background, shifted];
}

/** The Diamond theme's light background, until the page's own is known */
export const DEFAULT_STRIPES = stripesOn([246, 246, 249]);

function emptyColour(row: number, col: number, stripes: StripeColours): Rgb {
  return stripes[(row + col) % LINE_SPACING === 0 ? 1 : 0];
}

/** Bin edges with each bin split into `parts` equal parts, to match the image */
export function splitEdges(edges: number[], parts: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    for (let k = 0; k < parts; k++) {
      out.push(edges[i] + ((edges[i + 1] - edges[i]) * k) / parts);
    }
  }
  out.push(edges[edges.length - 1]);
  return out;
}

/** How to draw a matrix as an image */
export type RgbOptions = {
  /** Pixels per matrix cell on each axis (default cellPixelsFor the matrix; 1 for /render's pixels) */
  cellPixels?: number;
  /** How much of each cell is drawn, 0 to 1 (/render): the rest shows the stripes */
  coverage?: number[][];
  /** Opacity of white outlines over each cell, 0 to 1 (/render's footprints) */
  outline?: number[][];
};

/**
 * The matrix as an RGB image in one colour, scaled over its own range, each
 * cell `cellPixels` pixels square. Cells without a value are stripes in the
 * given colours, and a partly covered cell fades into them. If every value is
 * the same (a single point, say), they are drawn at full brightness rather
 * than black.
 */
export function toRgbNdt(
  matrix: (number | null)[][] | null,
  colour: RGBColour,
  stripes: StripeColours = DEFAULT_STRIPES,
  { cellPixels, coverage, outline }: RgbOptions = {},
): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return emptyNdt(stripes); // skip invalid input
  }
  const height = matrix.length;
  const width = matrix[0].length;
  cellPixels ??= cellPixelsFor(width, height);
  const flat = matrix.flat();

  // the range of the values, ignoring empty cells (a loop: /render's images
  // are too large to spread into Math.min)
  let min = Infinity;
  let max = -Infinity;
  for (const v of flat) {
    if (v !== null && !isNaN(v)) {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }
  const scale = max > min ? 255 / (max - min) : 0;
  const lit = { red: [0], green: [1], blue: [2], gray: [0, 1, 2] }[colour];

  const W = width * cellPixels;
  const H = height * cellPixels;
  const rgb = new Uint8Array(W * H * 3);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const r = Math.floor(y / cellPixels);
      const c = Math.floor(x / cellPixels);
      const v = flat[r * width + c];
      const empty = emptyColour(y, x, stripes);
      const covered = v === null || isNaN(v) ? 0 : (coverage?.[r]?.[c] ?? 1);
      const scaled = covered && max > min ? (v! - min) * scale : 255;
      const line = outline?.[r]?.[c] ?? 0;
      for (let k = 0; k < 3; k++) {
        const value = lit.includes(k) ? scaled : 0;
        const out = covered * value + (1 - covered) * empty[k];
        rgb[i + k] = Math.round(out * (1 - line) + 255 * line);
      }
    }
  }

  return ndarray(rgb, [H, W, 3]) as NDT;
}

/** Placeholder before any data: 3x3 empty cells, matching initialAxes */
export function emptyNdt(stripes: StripeColours): NDT {
  return toRgbNdt(
    [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    "gray",
    stripes,
  );
}

/**
 * A channel's matrix, or for a run without it (null), empty cells the shape of
 * the camera's, so it still lines up with the axes
 */
export function orEmptyLike(
  matrix: (number | null)[][] | null,
  like: (number | null)[][],
): (number | null)[][] {
  return matrix ?? like.map(row => row.map(() => null));
}

/**
 * Bin edges as plot axis values. The plot reads one more value than there are
 * pixels as the pixels' edges, so each cell sits exactly between its own edges.
 * (Given cell centres instead, it reads them as each pixel's leading edge and
 * shifts the image by half a cell.)
 */
export function binEdgesToAxis(edges: number[]): NDT {
  if (edges.length < 2) {
    throw new Error("At least two bin edges are required");
  }
  return ndarray(Float64Array.from(edges), [edges.length]) as NDT;
}

/** /binned or /render answered 503: the data file is behind the catalog, try again shortly */
export type NotReady = { notReady: true; retryAfterMs: number };

/** Evenly spaced edges from `start` to `stop` for `count` pixels */
function pixelEdges(start: number, stop: number, count: number): number[] {
  return Array.from(
    { length: count + 1 },
    (_, i) => start + ((stop - start) * i) / count,
  );
}

// initial axes must have min three points...
const INITIAL_EDGES = [-0.25, 0.25, 0.5, 0.75];
const initialAxes = binEdgesToAxis(
  splitEdges(INITIAL_EDGES, cellPixelsFor(3, 3)),
);
