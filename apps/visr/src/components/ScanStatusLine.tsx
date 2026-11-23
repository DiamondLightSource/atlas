import {
  Box,
  CircularProgress,
  Fade,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { WorkerState } from "@atlas/blueapi";
import {
  useScanStatus,
  type ScanStatus,
  type WorkerReach,
} from "../hooks/useScanStatus";

/** After a scan: the plots' last points aren't ready yet, or couldn't be fetched */
export type LastPointsStatus = "loading" | "missing";

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

/** "Complete" goes idle after this; problems stay until the next scan */
const IDLE_AFTER_MS = 5000;
const FADE_MS = 1000;

/** 0:07, 1:42, 1:02:03 */
function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}

/** The current time, ticking each second while `active` */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

type Pauses = { id?: string; total: number; since?: number };

/** Time spent paused during the run `id`: finished pauses, and any going on */
function usePauses(id: string | undefined, paused: boolean): Pauses {
  const [pauses, setPauses] = useState<Pauses>({ total: 0 });
  useEffect(() => {
    const now = Date.now();
    setPauses(current => {
      if (current.id !== id) {
        return { id, total: 0, since: paused ? now : undefined };
      }
      if (paused && current.since === undefined) {
        return { ...current, since: now };
      }
      if (!paused && current.since !== undefined) {
        return { id, total: current.total + now - current.since };
      }
      return current;
    });
  }, [id, paused]);
  return pauses;
}

/** Whether the line under `key` has had its time and gone idle */
function useGoneIdle(key: string, goesIdle: boolean): boolean {
  const [idleKey, setIdleKey] = useState<string | null>(null);
  useEffect(() => {
    if (!goesIdle) return;
    const timer = setTimeout(() => setIdleKey(key), IDLE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [key, goesIdle]);
  return goesIdle && idleKey === key;
}

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

type Line = {
  text: string;
  /** Duration after the text */
  time?: string;
  colour: string;
  /** Changes on its own: shown with a spinner */
  busy?: boolean;
  /** Goes idle after a while */
  goesIdle?: boolean;
  /** Fades in */
  fadeIn?: boolean;
  /** Full text on hover, for text cut short */
  detail?: string;
};

const IDLE_LINE: Line = { text: "Idle", colour: "text.secondary" };
const UNREACHABLE_LINE: Line = {
  text: "Worker unreachable",
  colour: "warning.main",
};

/** Plans with no scan type, by name */
const PLAN_LABELS: Record<string, string> = {
  darks_flats: "Darks/flats",
};

/** The worker's states other than plain running */
const WORKER_STATES: Partial<Record<WorkerState, Omit<Line, "time">>> = {
  PAUSING: { text: "pausing…", colour: "warning.main", busy: true },
  PAUSED: { text: "paused", colour: "warning.main" },
  SUSPENDING: { text: "suspending…", colour: "warning.main", busy: true },
  HALTING: { text: "halting…", colour: "warning.main", busy: true },
  STOPPING: { text: "stopping…", colour: "warning.main", busy: true },
  ABORTING: { text: "aborting…", colour: "warning.main", busy: true },
  PANICKED: { text: "panicked", colour: "error.main" },
};

/** "Fly scan", "Darks/flats", or plain "Scan" */
function label({ scanType, planName }: ScanStatus): string {
  if (scanType) {
    return `${scanType.charAt(0).toUpperCase()}${scanType.slice(1)} scan`;
  }
  if (planName) return PLAN_LABELS[planName] ?? planName;
  return "Scan";
}

function describe(
  status: ScanStatus,
  lastPoints: LastPointsStatus | null,
  /** Time running so far, less pauses */
  elapsed: number | undefined,
): Line {
  const name = label(status);
  const { startedAt, endedAt } = status;
  switch (status.phase) {
    case "running": {
      const time = elapsed !== undefined ? formatDuration(elapsed) : undefined;
      const worker = status.workerState && WORKER_STATES[status.workerState];
      if (worker) return { ...worker, text: `${name} ${worker.text}`, time };
      return {
        text: `${name} running`,
        time,
        colour: "info.main",
        busy: true,
      };
    }
    case "ending":
      return { text: `${name} finishing…`, colour: "info.main", busy: true };
    case "complete":
      if (lastPoints === "loading") {
        return {
          text: `${name} complete, loading the last points…`,
          colour: "info.main",
          busy: true,
        };
      }
      if (lastPoints === "missing") {
        return {
          text: `${name} complete. Some of the last points could not be loaded`,
          colour: "warning.main",
        };
      }
      return {
        text: `${name} complete`,
        time:
          startedAt !== undefined && endedAt !== undefined
            ? formatDuration(endedAt - startedAt)
            : undefined,
        colour: "success.main",
        goesIdle: true,
      };
    case "finished":
      return {
        text: `${name} finished`,
        colour: "text.secondary",
        goesIdle: true,
      };
    case "aborted":
      return { text: `${name} aborted`, colour: "warning.main" };
    case "failed":
      return {
        text: status.error
          ? `${name} failed: ${status.error}`
          : `${name} failed`,
        colour: "error.main",
        detail: status.error,
      };
  }
}

/** The line to show, and what it is showing; null for nothing */
function chooseLine(
  status: ScanStatus | null,
  worker: WorkerReach,
  lastPoints: LastPointsStatus | null,
  elapsed: number | undefined,
): { line: Line; key: string } | null {
  // a running scan is still known from the scan events; nothing else is
  const scanRunning = status?.source === "scan" && status.phase === "running";
  if (worker === "unreachable" && !scanRunning) {
    return { line: UNREACHABLE_LINE, key: "unreachable" };
  }
  if (!status) {
    return worker === "loading" ? null : { line: IDLE_LINE, key: "idle" };
  }
  return {
    line: describe(status, lastPoints, elapsed),
    // changes with the state, not the ticking time
    key: `${status.id}-${status.phase}-${status.workerState}-${lastPoints}`,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const fixedSx = { flexShrink: 0 };

/**
 * One line; remounted when it changes, so a fade starts afresh. The spinner
 * goes after the text: the line is right-aligned, so it stays put.
 */
function StatusText({ line }: { line: Line }) {
  return (
    <Fade in appear={line.fadeIn ?? false} timeout={FADE_MS}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
          color: line.colour,
          typography: "body1",
          fontWeight: 500,
        }}
      >
        <Tooltip title={line.detail ?? ""} disableHoverListener={!line.detail}>
          <Typography variant="inherit" noWrap>
            {line.text}
          </Typography>
        </Tooltip>
        {line.busy ? (
          <CircularProgress
            size={16}
            thickness={5}
            color="inherit"
            sx={fixedSx}
          />
        ) : (
          line.time && <Box sx={fixedSx}>·</Box>
        )}
        {line.time && (
          <Box sx={{ ...fixedSx, fontVariantNumeric: "tabular-nums" }}>
            {line.time}
          </Box>
        )}
      </Box>
    </Fade>
  );
}

interface ScanStatusLineProps {
  /** The plots' last points, for a view that polls for them after the scan */
  lastPoints?: LastPointsStatus | null;
}

/** The latest scan or plan in one line, "Idle", or "Worker unreachable" */
export function ScanStatusLine({ lastPoints = null }: ScanStatusLineProps) {
  const { status, worker } = useScanStatus();
  const running = status?.phase === "running";
  const paused = running && status.workerState === "PAUSED";
  const now = useNow(running && !paused);
  const pauses = usePauses(status?.id, paused);
  const elapsed =
    running && status.startedAt !== undefined
      ? (pauses.since ?? now) - status.startedAt - pauses.total
      : undefined;

  const chosen = chooseLine(status, worker, lastPoints, elapsed);
  const goneIdle = useGoneIdle(
    chosen?.key ?? "",
    chosen?.line.goesIdle ?? false,
  );
  if (!chosen) return null;
  return (
    <Box
      role="status"
      sx={{ display: "flex", alignItems: "center", minWidth: 0 }}
    >
      <StatusText
        key={goneIdle ? "gone-idle" : chosen.key}
        line={goneIdle ? { ...IDLE_LINE, fadeIn: true } : chosen.line}
      />
    </Box>
  );
}

export default ScanStatusLine;
