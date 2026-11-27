// A Bluesky run's metadata holds its start document and, once finished, its
// stop document. Anything missing or of an unexpected type is left undefined.

export interface RunSummary {
  scanId?: string;
  planName?: string;
  /** Unix seconds */
  startTime?: number;
  stopTime?: number;
  finished: boolean;
  exitStatus?: string;
  detectors?: number;
  motors?: number;
  numPoints?: number;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function text(value: unknown) {
  return typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
    ? String(value)
    : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function count(value: unknown) {
  return Array.isArray(value) ? value.length : undefined;
}

export function summariseRun(metadata: unknown): RunSummary {
  const start = record(record(metadata)?.start) ?? {};
  const stop = record(record(metadata)?.stop);
  return {
    scanId: text(start.scan_id),
    planName: text(start.plan_name),
    startTime: number(start.time),
    stopTime: number(stop?.time),
    finished: stop !== undefined,
    exitStatus: text(stop?.exit_status),
    detectors: count(start.detectors),
    motors: count(start.motors),
    numPoints: number(start.num_points),
  };
}

/** A run has no stop document until it finishes */
export function getStatus({ finished, exitStatus }: RunSummary) {
  if (!finished) return "running";
  return exitStatus ?? "unknown";
}

export type StatusColour =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral";

export function getColour(status: string): StatusColour {
  switch (status) {
    case "success":
      return "success";
    case "running":
      return "info";
    case "abort":
      return "warning";
    case "fail":
      return "danger";
    default:
      return "neutral";
  }
}

export function normaliseCase(status: string) {
  return status.charAt(0).toUpperCase() + status.substring(1).toLowerCase();
}

export function formatTime(seconds?: number) {
  return seconds === undefined
    ? undefined
    : new Date(seconds * 1000).toLocaleTimeString();
}
