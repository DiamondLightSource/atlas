import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents/useScanEvents";
import type { ScanStatus } from "./scanStatus";

/** SpectroscopyData wrapped as NDT for ease of Davidia plotting */
export interface DataChannels {
  cameraRed: NDT;
  cameraGreen: NDT;
  cameraBlue: NDT;
  diodesRed: NDT;
  diodesGreen: NDT;
  diodesBlue: NDT;
  xValues: NDT;
  yValues: NDT;
  /** The beam size /render drew with, and where it came from (Gaussian and footprints) */
  beam?: Beam;
}

/** A beam size (FWHM, in motor units) and where /render took it from */
export type Beam = {
  x: number;
  y: number;
  source: "request" | "metadata" | "scan step";
};

/** Return type of `/api/data/binned` */
type SpectroscopyData = {
  RedTotal: (number | null)[][];
  GreenTotal: (number | null)[][];
  BlueTotal: (number | null)[][];
  /** Null for a run without diodes */
  DiodesRed: (number | null)[][] | null;
  DiodesGreen: (number | null)[][] | null;
  DiodesBlue: (number | null)[][] | null;
  /** X bin edges with size of the above datasets + 1 */
  x_limits: number[];
  /** Y bin edges with size of the above datasets + 1 */
  y_limits: number[];
};

type Matrix = (number | null)[][];

/** Return type of `/api/data/render` (JSON) */
type RenderData = {
  viewport: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    width: number;
    height: number;
  };
  channels: Record<"RedTotal" | "GreenTotal" | "BlueTotal", Matrix> &
    /** Null for a run without diodes */
    Record<"DiodesRed" | "DiodesGreen" | "DiodesBlue", Matrix | null>;
  coverage: number[][];
  outline?: number[][];
  beam?: Beam;
};

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
function emptyNdt(stripes: StripeColours): NDT {
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

/**
 * The JSON at `url`, or NotReady when the server says the data isn't written
 * yet (503, waiting as long as its Retry-After asks, 1 s by default). Any
 * other failure throws.
 */
async function fetchJson<T>(url: string): Promise<T | NotReady> {
  const resp = await fetch(url);
  if (resp.status === 503) {
    const seconds = Number(resp.headers.get("Retry-After"));
    return {
      notReady: true,
      retryAfterMs:
        (Number.isFinite(seconds) && seconds > 0 ? seconds : 1) * 1000,
    };
  }
  if (!resp.ok) throw new Error(resp.statusText);
  return await resp.json(); // here we should use zod
}

/** The binned images of a run, or NotReady */
export function fetchData(uuid: string): Promise<SpectroscopyData | NotReady> {
  return fetchJson<SpectroscopyData>(`/api/data/binned/${uuid}`);
}

/** A run drawn by /render over the scan's extent, or NotReady */
export function fetchRender(
  uuid: string,
  kind: Exclude<PlotKind, "cells">,
): Promise<RenderData | NotReady> {
  return fetchJson<RenderData>(
    `/api/data/render/${uuid}?kind=${kind}&size=${RENDER_SIZE}`,
  );
}

/** Evenly spaced edges from `start` to `stop` for `count` pixels */
function pixelEdges(start: number, stop: number, count: number): number[] {
  return Array.from(
    { length: count + 1 },
    (_, i) => start + ((stop - start) * i) / count,
  );
}

/** Tries for the final image of a scan, when a 503 isn't followed by another poll */
const FINAL_POLL_ATTEMPTS = 10;

/** What one poll got: the data, a failure, or the wait the server asked for */
type PollResult = "done" | "error" | { retryAfterMs: number };

// initial axes must have min three points...
const INITIAL_EDGES = [-0.25, 0.25, 0.5, 0.75];
const initialAxes = binEdgesToAxis(
  splitEdges(INITIAL_EDGES, cellPixelsFor(3, 3)),
);

/**
 * /binned's or /render's answer as plot images, empty cells in the given
 * stripes. A channel the run lacks (the diodes) is drawn all empty.
 */
export function toChannels(
  answer: SpectroscopyData | RenderData | null,
  stripes: StripeColours,
): DataChannels {
  if (answer && "viewport" in answer) {
    const v = answer.viewport;
    const ch = answer.channels;
    const options = {
      cellPixels: 1,
      coverage: answer.coverage,
      outline: DRAW_OUTLINES ? answer.outline : undefined,
    };
    const image = (matrix: Matrix | null, colour: RGBColour) =>
      toRgbNdt(orEmptyLike(matrix, ch.RedTotal), colour, stripes, options);
    return {
      cameraRed: image(ch.RedTotal, "red"),
      cameraGreen: image(ch.GreenTotal, "green"),
      cameraBlue: image(ch.BlueTotal, "blue"),
      diodesRed: image(ch.DiodesRed, "red"),
      diodesGreen: image(ch.DiodesGreen, "green"),
      diodesBlue: image(ch.DiodesBlue, "blue"),
      xValues: binEdgesToAxis(pixelEdges(v.x0, v.x1, v.width)),
      yValues: binEdgesToAxis(pixelEdges(v.y0, v.y1, v.height)),
      beam: answer.beam,
    };
  }
  const binned = answer;
  if (!binned) {
    const empty = emptyNdt(stripes);
    return {
      cameraRed: empty,
      cameraGreen: empty,
      cameraBlue: empty,
      diodesRed: empty,
      diodesGreen: empty,
      diodesBlue: empty,
      xValues: initialAxes,
      yValues: initialAxes,
    };
  }
  // every channel and both axes split each cell into the same number of pixels
  const parts = cellPixelsFor(
    binned.RedTotal[0]?.length ?? 1,
    binned.RedTotal.length,
  );
  const image = (matrix: (number | null)[][] | null, colour: RGBColour) =>
    toRgbNdt(orEmptyLike(matrix, binned.RedTotal), colour, stripes, {
      cellPixels: parts,
    });
  return {
    cameraRed: image(binned.RedTotal, "red"),
    cameraGreen: image(binned.GreenTotal, "green"),
    cameraBlue: image(binned.BlueTotal, "blue"),
    diodesRed: image(binned.DiodesRed, "red"),
    diodesGreen: image(binned.DiodesGreen, "green"),
    diodesBlue: image(binned.DiodesBlue, "blue"),
    xValues: binEdgesToAxis(splitEdges(binned.x_limits, parts)),
    yValues: binEdgesToAxis(splitEdges(binned.y_limits, parts)),
  };
}

/**
 * The scan drawn as `kind`, polled while it runs, with empty cells in
 * `stripes`
 */
export function useSpectroscopyData(
  kind: PlotKind = "cells",
  stripes: StripeColours = DEFAULT_STRIPES,
): {
  data: DataChannels;
  running: boolean;
  status: ScanStatus | null;
} {
  const scanEvent = useScanEvents();
  const [running, setRunning] = useState<boolean>(false);
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  // kept as the server answered, so a theme change redraws it without a poll
  const [answer, setAnswer] = useState<SpectroscopyData | RenderData | null>(
    null,
  );
  const data = useMemo(() => toChannels(answer, stripes), [answer, stripes]);

  /** Cached interval id */
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // React to scan updates
  useEffect(() => {
    if (!scanEvent) return;

    if (scanEvent.status === "running") {
      setRunning(true);
      setUuid(scanEvent.uuid);
      setStatus("scanning");
    } else if (
      scanEvent.status === "finished" ||
      scanEvent.status === "failed"
    ) {
      setRunning(false); // triggers final poll below
      if (scanEvent.status === "failed") setStatus("failed");
    }
  }, [scanEvent]);

  // Poll during scan + once more afterwards
  useEffect(() => {
    let cancelled = false;

    async function poll(): Promise<PollResult> {
      if (!uuid) return "error";
      try {
        const resp = await (kind === "cells"
          ? fetchData(uuid)
          : fetchRender(uuid, kind));
        if (cancelled) return "done"; // the kind or scan changed meanwhile
        if ("notReady" in resp) return resp; // the next poll tries again
        setAnswer(resp);
      } catch (err) {
        console.error("Polling error:", err);
        return "error";
      }
      return "done";
    }

    /** The last poll after a scan ends: no later poll will follow a 503, so retry */
    async function finalPoll() {
      // a failed scan stays "failed", whatever its last points do
      const settle = (next: ScanStatus) =>
        setStatus(current => (current === "failed" ? current : next));
      for (
        let attempt = 0;
        attempt < FINAL_POLL_ATTEMPTS && !cancelled;
        attempt++
      ) {
        const result = await poll();
        if (cancelled) return;
        if (result === "done") return settle("complete");
        if (result === "error") return settle("lastPointsMissing");
        settle("loadingLastPoints");
        await new Promise(resolve => setTimeout(resolve, result.retryAfterMs));
      }
      if (!cancelled) settle("lastPointsMissing");
    }

    if (running && uuid) {
      // start polling
      pollInterval.current = setInterval(poll, 500); // 2 Hz
    } else if (!running && uuid) {
      // The scan has ended: poll once more for its last points. (The previous
      // run of this effect has already cleared the interval, so this can't
      // depend on the interval still being set.)
      void finalPoll();
    }

    return () => {
      cancelled = true;
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [running, uuid, kind]);

  return { data, running, status };
}
