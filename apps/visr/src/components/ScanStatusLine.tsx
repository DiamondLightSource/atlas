import {
  Box,
  CircularProgress,
  Fade,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { ScanStatus } from "../hooks/useScanStatus";

/**
 * Where the plots' last points are after a scan ends: the server isn't ready
 * with them yet, or they couldn't be fetched
 */
export type LastPointsStatus = "loading" | "missing";

/** Plans with no scan type, by the name the status line gives them */
const PLAN_LABELS: Record<string, string> = {
  darks_flats: "Darks/flats",
};

/** "Fly scan", "Darks/flats", or plain "Scan" */
function scanLabel({ scanType, planName }: ScanStatus): string {
  if (scanType) {
    return `${scanType.charAt(0).toUpperCase()}${scanType.slice(1)} scan`;
  }
  if (planName) return PLAN_LABELS[planName] ?? planName;
  return "Scan";
}

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

type Line = {
  text: string;
  colour: string;
  /** Will change on its own: shown with a spinner */
  busy?: boolean;
  /** Fades out after a while: nothing more to say */
  fades?: boolean;
  /** Shown in full on hover, for text cut short */
  detail?: string;
};

function describe(
  status: ScanStatus,
  lastPoints: LastPointsStatus | null,
  now: number,
): Line {
  const label = scanLabel(status);
  const { startedAt, endedAt } = status;
  switch (status.phase) {
    case "running":
      return {
        text:
          startedAt !== undefined
            ? `${label} running · ${formatDuration(now - startedAt)}`
            : `${label} running`,
        colour: "text.secondary",
        busy: true,
      };
    case "complete": {
      if (lastPoints === "loading") {
        return {
          text: `${label} complete, loading the last points…`,
          colour: "text.secondary",
          busy: true,
        };
      }
      if (lastPoints === "missing") {
        return {
          text: `${label} complete. Some of the last points could not be loaded`,
          colour: "warning.main",
        };
      }
      const took =
        startedAt !== undefined && endedAt !== undefined
          ? ` · ${formatDuration(endedAt - startedAt)}`
          : "";
      return {
        text: `${label} complete${took}`,
        colour: "text.secondary",
        fades: true,
      };
    }
    case "aborted":
      return { text: `${label} aborted`, colour: "text.secondary" };
    case "failed":
      return {
        text: status.error
          ? `${label} failed: ${status.error}`
          : `${label} failed`,
        colour: "error.main",
        detail: status.error,
      };
  }
}

/** "Complete" fades out after this long; problems stay */
const COMPLETE_SHOWN_MS = 3000;
const FADE_MS = 1000;

/** One line of status; remounted when it changes, so a fade starts afresh */
function StatusText({ line }: { line: Line }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    if (!line.fades) return;
    const timer = setTimeout(() => setShown(false), COMPLETE_SHOWN_MS);
    return () => clearTimeout(timer);
  }, [line.fades]);
  return (
    <Fade in={shown} timeout={FADE_MS} appear={false}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}
      >
        {line.busy && (
          <CircularProgress
            size={10}
            thickness={5}
            color="inherit"
            sx={{ flexShrink: 0 }}
          />
        )}
        <Tooltip title={line.detail ?? ""} disableHoverListener={!line.detail}>
          <Typography variant="caption" color={line.colour} noWrap>
            {line.text}
          </Typography>
        </Tooltip>
      </Box>
    </Fade>
  );
}

interface ScanStatusLineProps {
  status: ScanStatus | null;
  /** The plots' last points, for a view that polls for them after the scan */
  lastPoints?: LastPointsStatus | null;
}

/** The latest scan's status in one quiet line */
export function ScanStatusLine({
  status,
  lastPoints = null,
}: ScanStatusLineProps) {
  const now = useNow(status?.phase === "running");
  if (!status) return null;
  const line = describe(status, lastPoints, now);
  // the key changes with the state, not the ticking time, so only a new state
  // restarts the fade
  const key = `${status.uuid}-${status.phase}-${lastPoints}-${line.busy}`;
  return (
    <Box
      role="status"
      sx={{ display: "flex", alignItems: "center", minWidth: 0 }}
    >
      <StatusText key={key} line={line} />
    </Box>
  );
}

export default ScanStatusLine;
