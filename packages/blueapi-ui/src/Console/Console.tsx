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
  // prompt state, needs consolidating with the above
  const [state, setState] = useState<CommandPromptState>("ready");
  // log entries...
  const [lines, setLines] = useState<LogEntry[]>([]);
  // cached incomplete command
  const incompleteCommandRef = useRef<string | null>(null);

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
        // note that 'partial' for the log means something a little different than for me:
        // for the log it will determine the prefix for a command (e.g. >>> vs ...),
        // but the initial line of a multi-line block will still want to show >>>
        partial: !(incompleteCommandRef.current === null),
      };
      setLines((prev) => [...prev, logEntry]);
    },
    [],
  );

  async function interruptKernel() {
    let kernel: Kernel.IKernelConnection;
    try {
      kernel = await getKernel();
      kernel.interrupt();
      incompleteCommandRef.current = null;
    } catch {
      appendEntry("Could not connect to kernel!", "error");
      return;
    }
  }

  const handleCommand: CommandHandler = useCallback(
    async (input: string) => {
      let kernel: Kernel.IKernelConnection;
      try {
        kernel = await getKernel();
      } catch {
        appendEntry("Could not connect to kernel!", "error");
        return;
      }

      // Build the complete piece of Python code that should be sent to the
      // kernel. If we're continuing an incomplete command, append this line
      // to the previously accumulated code.
      const command = incompleteCommandRef.current
        ? `${incompleteCommandRef.current}\n${input}`
        : input;

      const completion = await kernel.requestIsComplete({ code: command });
      const partial = completion.content.status === "incomplete";

      // We show what the user typed exactly
      appendEntry(input, "command");

      if (partial) {
        incompleteCommandRef.current = command;
        setState("continuation");
        return;
      }

      // The command is complete; stop accumulating
      incompleteCommandRef.current = null;

      setState("evaluating");
      try {
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
          interrupt={interruptKernel}
        />
      </Box>
    </Paper>
  );
};
