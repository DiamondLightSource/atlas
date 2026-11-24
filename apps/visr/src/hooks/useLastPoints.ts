import { createContext, useContext, useEffect } from "react";
import type { LastPointsStatus } from "../components/ScanStatusLine";

type LastPoints = {
  lastPoints: LastPointsStatus | null;
  setLastPoints: (status: LastPointsStatus | null) => void;
};

/** A view's plots' last points, for the status bar */
export const LastPointsContext = createContext<LastPoints | null>(null);

export function useLastPoints(): LastPointsStatus | null {
  return useContext(LastPointsContext)?.lastPoints ?? null;
}

/**
 * Reports a view's last points to the status bar; they are cleared when the
 * view goes, so another page doesn't show them
 */
export function useReportLastPoints(): (
  lastPoints: LastPointsStatus | null,
) => void {
  const setLastPoints = useContext(LastPointsContext)?.setLastPoints;
  useEffect(() => () => setLastPoints?.(null), [setLastPoints]);
  return setLastPoints ?? noop;
}

function noop() {}
