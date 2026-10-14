import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useEffect, useRef, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents/useScanEvents";

/** SpectroscopyData wrapped as NDT for ease of Davidia plotting */
export interface DataChannels {
  red: NDT;
  green: NDT;
  blue: NDT;
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
  /** X bin edges with size of the above datasets + 1 */
  x_limits: number[];
  /** Y bin edges with size of the above datasets + 1 */
  y_limits: number[];
};

export type RGBColour = "red" | "green" | "blue" | "gray";

/**
 * Each cell is drawn as CELL_PIXELS x CELL_PIXELS pixels, so cells no point has
 * landed in yet can carry a pattern: diagonal stripes in two greys, which can't
 * be mistaken for a measured value (dark or not) and run on unbroken across
 * the empty part of the scan. The axes are split to match.
 */
export const CELL_PIXELS = 4;
export const EMPTY_STRIPE_GREYS = [142, 120] as const;

function emptyGrey(row: number, col: number): number {
  return EMPTY_STRIPE_GREYS[Math.floor(((row + col) % 4) / 2)];
}

/** Bin edges with each bin split into CELL_PIXELS equal parts, to match the image */
export function splitEdges(edges: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    for (let k = 0; k < CELL_PIXELS; k++) {
      out.push(edges[i] + ((edges[i + 1] - edges[i]) * k) / CELL_PIXELS);
    }
  }
  out.push(edges[edges.length - 1]);
  return out;
}

/** How to draw a matrix as an image */
export type RgbOptions = {
  /** Pixels per matrix cell on each axis (CELL_PIXELS for /binned's cells, 1 for /render's pixels) */
  cellPixels?: number;
  /** How much of each cell is drawn, 0 to 1 (/render): the rest shows the empty stripes */
  coverage?: number[][];
  /** Opacity of white outlines over each cell, 0 to 1 (/render's footprints) */
  outline?: number[][];
};

/**
 * The matrix as an RGB image in one colour, scaled over its own range, each
 * cell `cellPixels` pixels square. Cells without a value are grey stripes,
 * and a partly covered cell fades into them. If every value is the same (a
 * single point, say), they are drawn at full brightness rather than black.
 */
export function toRgbNdt(
  matrix: (number | null)[][],
  colour: RGBColour,
  { cellPixels = CELL_PIXELS, coverage, outline }: RgbOptions = {},
): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return EMPTY_NDT; // skip invalid input
  }
  const height = matrix.length;
  const width = matrix[0].length;
  const flat = matrix.flat();

  let min = Infinity;
  let max = -Infinity;
  for (const v of flat) {
    if (v !== null && !isNaN(v)) {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }
  const scale = max > min ? 255 / (max - min) : 0;
  const channel = { red: [0], green: [1], blue: [2], gray: [0, 1, 2] }[colour];

  const W = width * cellPixels;
  const H = height * cellPixels;
  const rgb = new Uint8Array(W * H * 3);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const r = Math.floor(y / cellPixels);
      const c = Math.floor(x / cellPixels);
      const v = flat[r * width + c];
      const grey = emptyGrey(y, x);
      const covered = v === null || isNaN(v) ? 0 : (coverage?.[r]?.[c] ?? 1);
      const scaled = max > min ? (v! - min) * scale : 255;
      for (let k = 0; k < 3; k++) {
        const value = channel.includes(k) ? scaled : 0;
        let out = covered * value + (1 - covered) * grey;
        const line = outline?.[r]?.[c] ?? 0;
        out = out * (1 - line) + 255 * line;
        rgb[i + k] = Math.round(out);
      }
    }
  }

  return ndarray(rgb, [H, W, 3]) as NDT;
}

/** Placeholder empty gray dataset */
const EMPTY_NDT = toRgbNdt([[null, null, null]], "gray");

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

/** How the scan is drawn: /binned's cells, or one of /render's kinds */
export type PlotKind = "cells" | "rectangles" | "gaussian" | "ovals";

/** Longest side, in pixels, of the images /render draws */
export const RENDER_SIZE = 200;

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
  channels: Record<
    "RedTotal" | "GreenTotal" | "BlueTotal",
    (number | null)[][]
  >;
  coverage: number[][];
  outline?: number[][];
  beam?: Beam;
};

/** The JSON at `url`, or NotReady on a 503 (waiting as Retry-After asks, 1 s by default) */
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

/**
 * The binned images of a run, or NotReady when the server says the data isn't
 * written yet (503, waiting as long as its Retry-After asks, 1 s by default).
 * Any other failure throws.
 */
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

/** The channels and axes to plot from /binned's or /render's answer */
export function toChannels(resp: SpectroscopyData | RenderData): DataChannels {
  if ("viewport" in resp) {
    const v = resp.viewport;
    const options = {
      cellPixels: 1,
      coverage: resp.coverage,
      outline: resp.outline,
    };
    return {
      red: toRgbNdt(resp.channels.RedTotal, "red", options),
      green: toRgbNdt(resp.channels.GreenTotal, "green", options),
      blue: toRgbNdt(resp.channels.BlueTotal, "blue", options),
      xValues: binEdgesToAxis(pixelEdges(v.x0, v.x1, v.width)),
      yValues: binEdgesToAxis(pixelEdges(v.y0, v.y1, v.height)),
      beam: resp.beam,
    };
  }
  return {
    red: toRgbNdt(resp.RedTotal, "red"),
    green: toRgbNdt(resp.GreenTotal, "green"),
    blue: toRgbNdt(resp.BlueTotal, "blue"),
    xValues: binEdgesToAxis(splitEdges(resp.x_limits)),
    yValues: binEdgesToAxis(splitEdges(resp.y_limits)),
  };
}

/** Tries for the final image of a scan, when a 503 isn't followed by another poll */
const FINAL_POLL_ATTEMPTS = 10;

// initial axes must have min three points...
const initialAxes = binEdgesToAxis(splitEdges([-0.25, 0.25, 0.5, 0.75]));

export function useSpectroscopyData(kind: PlotKind = "cells"): {
  data: DataChannels;
  running: boolean;
} {
  const scanEvent = useScanEvents();
  const [running, setRunning] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const [data, setData] = useState<DataChannels>({
    red: EMPTY_NDT,
    green: EMPTY_NDT,
    blue: EMPTY_NDT,
    xValues: initialAxes,
    yValues: initialAxes,
  });

  /** Cached interval id */
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // React to scan updates
  useEffect(() => {
    if (!scanEvent) return;

    if (scanEvent.status === "running") {
      setRunning(true);
      setUuid(scanEvent.uuid);
    } else if (
      scanEvent.status === "finished" ||
      scanEvent.status === "failed"
    ) {
      setRunning(false); // triggers final poll below
    }
  }, [scanEvent]);

  // Poll during scan + once more afterwards
  useEffect(() => {
    let cancelled = false;

    /** One poll: the wait the server asks for if it isn't ready, else 0 */
    async function poll(): Promise<number> {
      if (!uuid) return 0;
      try {
        const resp = await (kind === "cells"
          ? fetchData(uuid)
          : fetchRender(uuid, kind));
        if ("notReady" in resp) return resp.retryAfterMs; // the next poll tries again
        setData(toChannels(resp));
      } catch (err) {
        console.error("Polling error:", err);
      }
      return 0;
    }

    /** The last poll after a scan ends: no later poll will follow a 503, so retry */
    async function finalPoll() {
      for (
        let attempt = 0;
        attempt < FINAL_POLL_ATTEMPTS && !cancelled;
        attempt++
      ) {
        const wait = await poll();
        if (!wait) return;
        await new Promise(resolve => setTimeout(resolve, wait));
      }
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

  return { data, running };
}
