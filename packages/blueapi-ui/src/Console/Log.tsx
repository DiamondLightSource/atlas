// This is the part of the console that shows timestamped commands with stdout/stderr.

import { Box, Paper, Typography } from "@mui/material";
import type React from "react";
import { useEffect, useRef } from "react";

export type LogEntry = {
  timestamp?: number;
  message: string;
  kind: "command" | "result" | "error";
};

type LogProps = {
  lines: LogEntry[];
};

type LogLineProps = {
  entry: LogEntry;
  showTimestamps?: boolean;
};

function formatTimestamp(
  epoch: number | undefined,
  showTimestamps: boolean | undefined,
) {
  if (!showTimestamps || !epoch) return "";
  const date = new Date(epoch);

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `[${hh}:${mm}:${ss}]`;
}
const LogLine = ({ entry, showTimestamps }: LogLineProps) => {
  const prefix = entry.kind === "command" ? ">>> " : "";
  return (
    <Typography variant="mono1" sx={{ display: "block" }}>
      {`${formatTimestamp(entry.timestamp, showTimestamps)} ${prefix}${entry.message}`}
    </Typography>
  );
};

export const Log = ({ lines }: LogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "auto",
    });
  }, [lines]);
  return (
    <Box
      ref={contentRef}
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        whiteSpace: "pre-wrap",
        px: 1.5,
        py: 0.5,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {lines.map((line, index) => (
        <LogLine entry={line} key={index} />
      ))}
    </Box>
  );
};
