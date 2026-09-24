import { Box, Paper } from "@mui/material";
import {
  CommandPrompt,
  type CommandHandler,
  type CommandPromptState,
} from "./CommandPrompt";
import { useCallback, useEffect, useRef, useState } from "react";
import { Log, type LogEntry } from "./Log";
import { executeCode, makeKernelManager, startKernel } from "./kernelclient";
import { Kernel } from "@jupyterlab/services";

const kernelManager = makeKernelManager();

export const Console = () => {
  // kernel status
  const [status, setStatus] = useState<"connecting" | "ready" | "error">(
    "connecting",
  );
  const kernelRef = useRef<Promise<Kernel.IKernelConnection> | null>(null);
  const getKernel = useCallback((): Promise<Kernel.IKernelConnection> => {
    if (!kernelRef.current) {
      kernelRef.current = startKernel(kernelManager, "python3")
        .then((kernel) => {
          setStatus("ready");
          return kernel;
        })
        .catch((err) => {
          setStatus("error");
          kernelRef.current = null;
          throw err;
        });
    }
    return kernelRef.current;
  }, []);

  useEffect(() => {
    getKernel().catch(() => {
      /* status already flipped to 'error' inside getKernel */
    });

    return () => {
      kernelRef.current?.then((kernel) => kernel.shutdown()).catch(() => {});
      kernelRef.current = null;
    };
  }, [getKernel]);

  const appendEntry = useCallback(
    (message: string, category: "command" | "result" | "error") => {
      const logEntry: LogEntry = {
        kind: category,
        timestamp: Date.now(),
        message,
      };
      setLines((prev) => [...prev, logEntry]);
    },
    [],
  );

  const handleCommand: CommandHandler = useCallback(
    async (command: string) => {
      appendEntry(command, "command");
      let kernel: Kernel.IKernelConnection;
      try {
        kernel = await getKernel();
      } catch {
        appendEntry("Could not connect to kernel!", "error");
        return;
      }

      try {
        setState("evaluating");
        await executeCode(kernel, command, (chunk) => {
          const cat = chunk.kind === "error" ? "error" : "result";
          console.log("Result", chunk);
          appendEntry(chunk.text, cat);
        });
      } catch (err) {
        appendEntry(
          `${err instanceof Error ? err.message : String(err)}`,
          "error",
        );
      } finally {
        setState("ready");
      }
    },
    [appendEntry, getKernel],
  );

  const [state, setState] = useState<CommandPromptState>("ready");
  const [lines, setLines] = useState<LogEntry[]>([]);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 400,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Log lines={lines} />
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CommandPrompt
          placeholder="Enter command..."
          onSubmit={handleCommand}
          status={state}
        />
      </Box>
    </Paper>
  );
};
