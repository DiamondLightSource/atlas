import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useEffect, useRef, useState } from "react";
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
  RedTotal: number[][];
  GreenTotal: number[][];
  BlueTotal: number[][];
  DiodesRed: number[][];
  DiodesGreen: number[][];
  DiodesBlue: number[][];
  /** X bin edges with size of the above datasets + 1 */
  x_limits: number[];
  /** Y bin edges with size of the above datasets + 1 */
  y_limits: number[];
};

type RGBColour = "red" | "green" | "blue" | "gray";

function toRgbNdt(matrix: (number | null)[][], colour: RGBColour): NDT {
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
  const scale = max > min ? 255 / (max - min) : 1;

  const rgb = new Uint8Array(width * height * 3);

  for (let i = 0; i < flat.length; i++) {
    const v = flat[i];
    let scaled = 0;
    if (v !== null && !isNaN(v)) {
      scaled = Math.round((v - min) * scale);
    } // else stays 0 (black)

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

  return ndarray(rgb, [height, width, 3]) as NDT;
}
/** Placeholder empty gray dataset */
const EMPTY_NDT = toRgbNdt([[0, 0, 0]], "gray");

/** given array of edges size L, returns the centre points, size L-1, as NDT */
export function binEdgesToCentrePoints(edges: number[]): NDT {
  if (edges.length < 2) {
    throw new Error("At least two bin edges are required");
  }

  const centres = new Float64Array(edges.length - 1);

  for (let i = 0; i < centres.length; i++) {
    centres[i] = (edges[i] + edges[i + 1]) / 2;
  }

  return ndarray(centres, [centres.length]);
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
const initialAxes = binEdgesToCentrePoints([-0.25, 0.25, 0.5, 0.75]);

export function useSpectroscopyData(): {
  data: DataChannels;
  running: boolean;
  status: ScanStatus | null;
} {
  const scanEvent = useScanEvents();
  const [running, setRunning] = useState<boolean>(false);
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [data, setData] = useState<DataChannels>({
    cameraRed: EMPTY_NDT,
    cameraGreen: EMPTY_NDT,
    cameraBlue: EMPTY_NDT,
    diodesRed: EMPTY_NDT,
    diodesGreen: EMPTY_NDT,
    diodesBlue: EMPTY_NDT,

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
        setData({
          cameraRed: toRgbNdt(resp.RedTotal, "red"),
          cameraGreen: toRgbNdt(resp.GreenTotal, "green"),
          cameraBlue: toRgbNdt(resp.BlueTotal, "blue"),
          diodesRed: toRgbNdt(resp.DiodesRed, "red"),
          diodesGreen: toRgbNdt(resp.DiodesGreen, "green"),
          diodesBlue: toRgbNdt(resp.DiodesBlue, "blue"),
          xValues: binEdgesToCentrePoints(resp.x_limits),
          yValues: binEdgesToCentrePoints(resp.y_limits),
        });
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
