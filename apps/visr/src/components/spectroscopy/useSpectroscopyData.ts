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
}

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

export type RGBColour = "red" | "green" | "blue" | "gray";

/**
 * Each cell is drawn as CELL_PIXELS x CELL_PIXELS pixels, so cells no point has
 * landed in yet can carry a pattern: faint diagonal stripes, which can't be
 * mistaken for a measured value (dark or not) and run on unbroken across the
 * empty part of the scan. The axes are split to match.
 */
export const CELL_PIXELS = 4;

/** An RGB colour, 0-255 each */
export type Rgb = readonly [number, number, number];

/** The two colours of the empty cells' stripes */
export type StripeColours = readonly [Rgb, Rgb];

/** How far the second stripe is from the background, 0-255 per channel */
export const STRIPE_CONTRAST = 10;

/**
 * Stripes that barely stand out from the background they sit on: one in the
 * background's own colour, the other slightly darker on a light background,
 * slightly lighter on a dark one
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
  return stripes[Math.floor(((row + col) % 4) / 2)];
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

/**
 * The matrix as an RGB image in one colour, scaled over its own range, each
 * cell CELL_PIXELS pixels square. Cells without a value are stripes in the
 * given colours. If
 * every value is the same (a single point, say), they are drawn at full
 * brightness rather than black.
 */
export function toRgbNdt(
  matrix: (number | null)[][] | null,
  colour: RGBColour,
  stripes: StripeColours = DEFAULT_STRIPES,
): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return emptyNdt(stripes); // skip invalid input
  }
  const height = matrix.length;
  const width = matrix[0].length;

  // Flatten and filter out nulls for normalisation
  const flat = matrix.flat();
  const valid = flat.filter((v): v is number => v !== null && !isNaN(v));

  // Avoid crashes when no valid values
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 1;
  const scale = max > min ? 255 / (max - min) : 0;

  const W = width * CELL_PIXELS;
  const H = height * CELL_PIXELS;
  const rgb = new Uint8Array(W * H * 3);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const v =
        flat[Math.floor(y / CELL_PIXELS) * width + Math.floor(x / CELL_PIXELS)];
      if (v === null || isNaN(v)) {
        rgb.set(emptyColour(y, x, stripes), i * 3);
        continue;
      }
      const scaled = max > min ? Math.round((v - min) * scale) : 255;
      switch (colour) {
        case "red":
          rgb[i * 3] = scaled;
          break;
        case "green":
          rgb[i * 3 + 1] = scaled;
          break;
        case "blue":
          rgb[i * 3 + 2] = scaled;
          break;
        case "gray":
          rgb[i * 3] = scaled;
          rgb[i * 3 + 1] = scaled;
          rgb[i * 3 + 2] = scaled;
          break;
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

/** /binned answered 503: the data file is behind the catalog, try again shortly */
export type NotReady = { notReady: true; retryAfterMs: number };

/**
 * The binned images of a run, or NotReady when the server says the data isn't
 * written yet (503, waiting as long as its Retry-After asks, 1 s by default).
 * Any other failure throws.
 */
export async function fetchData(
  uuid: string,
): Promise<SpectroscopyData | NotReady> {
  const url = `/api/data/binned/${uuid}`;
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

/** Tries for the final image of a scan, when a 503 isn't followed by another poll */
const FINAL_POLL_ATTEMPTS = 10;

/** What one poll got: the data, a failure, or the wait the server asked for */
type PollResult = "done" | "error" | { retryAfterMs: number };

// initial axes must have min three points...
const initialAxes = binEdgesToAxis(splitEdges([-0.25, 0.25, 0.5, 0.75]));

/** /binned's answer as plot images, empty cells in the given stripes */
function toChannels(
  binned: SpectroscopyData | null,
  stripes: StripeColours,
): DataChannels {
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
  const image = (matrix: (number | null)[][] | null, colour: RGBColour) =>
    toRgbNdt(orEmptyLike(matrix, binned.RedTotal), colour, stripes);
  return {
    cameraRed: image(binned.RedTotal, "red"),
    cameraGreen: image(binned.GreenTotal, "green"),
    cameraBlue: image(binned.BlueTotal, "blue"),
    diodesRed: image(binned.DiodesRed, "red"),
    diodesGreen: image(binned.DiodesGreen, "green"),
    diodesBlue: image(binned.DiodesBlue, "blue"),
    xValues: binEdgesToAxis(splitEdges(binned.x_limits)),
    yValues: binEdgesToAxis(splitEdges(binned.y_limits)),
  };
}

/** The scan's binned images, polled while it runs, with empty cells in `stripes` */
export function useSpectroscopyData(stripes: StripeColours = DEFAULT_STRIPES): {
  data: DataChannels;
  running: boolean;
  status: ScanStatus | null;
} {
  const scanEvent = useScanEvents();
  const [running, setRunning] = useState<boolean>(false);
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  // kept as /binned answered, so a theme change redraws it without a poll
  const [binned, setBinned] = useState<SpectroscopyData | null>(null);
  const data = useMemo(() => toChannels(binned, stripes), [binned, stripes]);

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
        const resp = await fetchData(uuid);
        if ("notReady" in resp) return resp; // the next poll tries again
        setBinned(resp);
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
  }, [running, uuid]);

  return { data, running, status };
}
