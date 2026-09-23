import { Box, Paper } from "@mui/material";
import { CommandPrompt, type CommandPromptState } from "./CommandPrompt";
import { useState } from "react";
import { Log, type LogEntry } from "./Log";

export const Console = () => {
  const [state, setState] = useState<CommandPromptState>("ready");
  const [lines, setLines] = useState<LogEntry[]>([]);
  const handleCommand = (command: string) => {
    const now = new Date(Date.now());
    const ts = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;
    const logEntry: LogEntry = {
      category: "command",
      timestamp: ts,
      message: command,
    };
    setLines((prev) => [...prev, logEntry]);
  };
  return (
    <Box sx={{ maxWidth: 500, border: "1px solid", borderColor: "divider" }}>
      <Log lines={lines} />
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CommandPrompt
          placeholder="Enter command..."
          onSubmit={handleCommand}
          status={state}
        />
      </Box>
    </Box>
  );
};
