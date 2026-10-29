// This is the part of the console that shows timestamped commands with stdout/stderr.

import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

export type LogEntry = {
  message: string;
  kind: "command" | "result" | "error";
  partial?: boolean;
};

type LogProps = {
  lines: LogEntry[];
};

type LogLineProps = {
  entry: LogEntry;
};

const getPrefix = (entry: LogEntry) => {
  if (entry.kind === "command") {
    if (entry.partial) return "... ";
    return ">>> ";
  }
  return "";
};

const LogLine = ({ entry }: LogLineProps) => {
  const prefix = getPrefix(entry);
  return (
    <Typography variant="mono1" sx={{ display: "block" }}>
      {`${prefix}${entry.message}`}
    </Typography>
  );
};

export const Log = ({ lines }: LogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // this could be protected by a scrollLock flag
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
