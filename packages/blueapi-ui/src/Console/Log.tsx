// This is the part of the console that shows timestamped commands with stdout/stderr.

import { Paper, Typography } from "@mui/material";

export type LogEntry = {
  timestamp?: string;
  message: string;
  category: "command" | "result" | "error";
};

type LogProps = {
  lines: LogEntry[];
};

export const Log = ({ lines }: LogProps) => {
  return (
    // <Paper sx={{ whiteSpace: "pre-wrap" }}>
    //   {lines.map((line, index) => (
    //     <Typography variant="mono1" sx={{ display: "block" }} key={index}>
    //       {`${line.timestamp} ${line.message}`}
    //     </Typography>
    //   ))}
    // </Paper>
    <pre>
      {lines.map((entry, i) => (
        <div key={i}>{entry.message}</div>
      ))}
    </pre>
  );
};
