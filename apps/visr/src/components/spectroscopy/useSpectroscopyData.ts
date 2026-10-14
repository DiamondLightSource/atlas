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
}

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

/**
 * The matrix as an RGB image in one colour, scaled over its own range, each
 * cell CELL_PIXELS pixels square. Cells without a value are grey stripes. If
 * every value is the same (a single point, say), they are drawn at full
 * brightness rather than black.
 */
export function toRgbNdt(matrix: (number | null)[][], colour: RGBColour): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return EMPTY_NDT; // skip invalid input
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
        rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = emptyGrey(y, x);
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

async function fetchData(uuid: string): Promise<SpectroscopyData> {
  const url = `/api/data/binned/${uuid}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(resp.statusText);
  return await resp.json(); // here we should use zod
}

// initial axes must have min three points...
const initialAxes = binEdgesToAxis(splitEdges([-0.25, 0.25, 0.5, 0.75]));

export function useSpectroscopyData(): {
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
    async function poll() {
      if (!uuid) return;
      try {
        const resp: SpectroscopyData = await fetchData(uuid);
        setData({
          red: toRgbNdt(resp.RedTotal, "red"),
          green: toRgbNdt(resp.GreenTotal, "green"),
          blue: toRgbNdt(resp.BlueTotal, "blue"),
          xValues: binEdgesToAxis(splitEdges(resp.x_limits)),
          yValues: binEdgesToAxis(splitEdges(resp.y_limits)),
        });
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    if (running && uuid) {
      // start polling
      pollInterval.current = setInterval(poll, 500); // 2 Hz
    } else if (!running && pollInterval.current) {
      // poll once more then clear interval
      poll().finally(() => {
        clearInterval(pollInterval.current!);
        pollInterval.current = null;
      });
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [running, uuid]);

  return { data, running };
}
