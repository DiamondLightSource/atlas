/**
 * Where the plotted scan is: from the scan events, then from the poll for its
 * last points once it has ended.
 */
export type ScanStatus =
  | "scanning"
  /** The scan ended; the server isn't ready with its last points yet */
  | "loadingLastPoints"
  | "complete"
  /** The scan ended, but its last points couldn't be fetched */
  | "lastPointsMissing"
  | "failed";

export const SCAN_STATUS_TEXT: Record<ScanStatus, string> = {
  scanning: "Scanning…",
  loadingLastPoints: "Scan complete, loading the last points…",
  complete: "Scan complete",
  lastPointsMissing:
    "Scan complete. Some of the last points could not be loaded",
  failed: "Scan failed",
};

/** Statuses that will change on their own, shown with a spinner */
export const SCAN_STATUS_BUSY: ReadonlySet<ScanStatus> = new Set([
  "scanning",
  "loadingLastPoints",
]);
