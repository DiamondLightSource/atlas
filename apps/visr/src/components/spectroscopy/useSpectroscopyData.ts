import { type NDT } from "@diamondlightsource/davidia";
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
  RedTotal: number[][];
  GreenTotal: number[][];
  BlueTotal: number[][];
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

async function fetchData(uuid: string): Promise<SpectroscopyData> {
  const url = `/api/data/binned/${uuid}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(resp.statusText);
  return await resp.json(); // here we should use zod
}

// initial axes must have min three points...
const initialAxes = binEdgesToCentrePoints([-0.25, 0.25, 0.5, 0.75]);

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
          xValues: binEdgesToCentrePoints(resp.x_limits),
          yValues: binEdgesToCentrePoints(resp.y_limits),
        });
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    if (running && uuid) {
      // start polling
      pollInterval.current = setInterval(poll, 100); // 10 Hz
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
