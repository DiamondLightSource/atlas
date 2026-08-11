import { useEffect, useRef, useState } from "react";
import { type NDT } from "@diamondlightsource/davidia";
import { useScanEvents } from "../../hooks/scanEvents/useScanEvents";

export type RGBColour = "red" | "green" | "blue" | "gray";

export type FetchMapFunction = (
  filepath: string,
  datapath: string,
  colour: RGBColour,
  snake: boolean,
) => Promise<NDT>;

export interface DataChannels {
  red: NDT | null;
  green: NDT | null;
  blue: NDT | null;
  // gray: NDT | null;
}

export function useSpectroscopyData(fetchMap: FetchMapFunction) {
  const scanEvent = useScanEvents();
  const [running, setRunning] = useState<boolean>(false);
  const [filepath, setFilepath] = useState<string | null>(null);
  const [snake, setSnake] = useState<boolean>(false);
  const [data, setData] = useState<DataChannels>({
    red: null,
    green: null,
    blue: null,
    // gray: null,
  });

  /** Cached interval id */
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // React to scan updates
  useEffect(() => {
    if (!scanEvent) return;

    if (scanEvent.status === "running") {
      setRunning(true);
      setFilepath(scanEvent.filepath);
      setSnake(scanEvent.snake);
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
      if (!filepath) return;
      try {
        const basePath = "/entry/instrument/spectroscopy_detector/";
        const [red, green, blue] = await Promise.all([
          fetchMap(filepath, basePath + "RedTotal", "red", snake),
          fetchMap(filepath, basePath + "GreenTotal", "green", snake),
          fetchMap(filepath, basePath + "BlueTotal", "blue", snake),
          // fetchMap(filepath, basePath + "GrayTotal", "gray", snake),
        ]);
        setData({ red, green, blue });
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    if (running && filepath) {
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
  }, [running, filepath, snake, fetchMap]);

  return { data, running };
}
