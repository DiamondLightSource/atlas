import { DataCard } from "@diamondlightsource/sci-react-ui";
import { Box, Link } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import {
  formatTime,
  getColour,
  getStatus,
  normaliseCase,
  summariseRun,
} from "./runSummary";
import type { MetadataField, Selection } from "./selection";
import type { TiledNode } from "./tiledService";

/** To give cards a common (and maximum) width */
const CardWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{ display: "flex", flex: 1, minWidth: "160px", maxWidth: "350px" }}
    >
      {children}
    </Box>
  );
};

/** e.g. "45s", "2m 13s", "1h 05m" */
function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
  return `${total}s`;
}

/** Time since `since` (seconds since the epoch), ticking every second */
function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return formatDuration(now / 1000 - since);
}

/** A row of data cards summarising `run` */
export function ScanSummary({
  run,
  onShow,
}: {
  run: TiledNode;
  onShow?: (selection: Selection) => void;
}) {
  const summary = summariseRun(run.metadata);
  const status = getStatus(summary);

  // DataCard's values are typed as strings, but any node renders
  const link = (text: string | undefined, ...field: MetadataField): string => {
    if (text === undefined) return "-";
    if (!onShow) return text;
    return (
      <Link
        component="button"
        underline="hover"
        color="inherit"
        title="Show in the metadata"
        onClick={() => onShow({ node: run, fields: [field] })}
        sx={{ font: "inherit", verticalAlign: "baseline" }}
      >
        {text}
      </Link>
    ) as unknown as string;
  };

  const statusValue = (): string => {
    const text = normaliseCase(status);
    if (summary.exitStatus !== undefined) {
      return link(text, "stop", "exit_status");
    }
    if (summary.finished || summary.startTime === undefined) return text;
    return (
      <>
        {text} · <Elapsed since={summary.startTime} />
      </>
    ) as unknown as string;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <CardWrapper>
        <DataCard
          title="Scan"
          value1={{
            label: "Scan ID",
            value: link(summary.scanId, "start", "scan_id"),
          }}
          value2={{
            label: "Plan",
            value: link(summary.planName, "start", "plan_name"),
          }}
          colour="neutral"
        />
      </CardWrapper>

      <CardWrapper>
        <DataCard
          title="Scan status"
          value={{ value: statusValue() }}
          subvalue={
            summary.finished
              ? {
                  label: "Finished",
                  value: link(formatTime(summary.stopTime), "stop", "time"),
                }
              : {
                  label: "Started",
                  value: link(formatTime(summary.startTime), "start", "time"),
                }
          }
          colour={getColour(status)}
        />
      </CardWrapper>

      <CardWrapper>
        <DataCard
          title="Devices"
          value1={{
            label: "Detectors",
            value: link(summary.detectors?.toString(), "start", "detectors"),
          }}
          value2={{
            label: "Motors",
            value: link(summary.motors?.toString(), "start", "motors"),
          }}
          colour="neutral"
        />
      </CardWrapper>

      <CardWrapper>
        <DataCard
          title="Points"
          value={{
            value: link(summary.numPoints?.toString(), "start", "num_points"),
          }}
          colour="neutral"
        />
      </CardWrapper>
    </Box>
  );
}
