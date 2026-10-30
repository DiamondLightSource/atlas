import { Paper } from "@mui/material";
import {
  CommandPrompt,
  type CommandHandler,
  type CommandPromptState,
} from "./CommandPrompt";
import { useCallback, useEffect, useRef, useState } from "react";
import { Log, type LogEntry } from "./Log";
import { executeCode, makeKernelManager, startKernel } from "./kernelclient";
import { Kernel } from "@jupyterlab/services";
import { useAuth } from "@atlas/auth";

const kernelManager = makeKernelManager({
  baseUrl: `${window.location.origin}/api/scripting/`,
  wsUrl: `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/scripting/`,
});

type KernelStatus = "connecting" | "ready" | "error";
export const Console = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <UnauthenticatedPlaceholder />;
  return <AuthenticatedConsole />;
};

const AuthenticatedConsole = () => {
  // kernel status
  const [kernelStatus, setKerneStatus] = useState<KernelStatus>("connecting");
  // prompt state
  const [promptState, setPromptState] =
    useState<CommandPromptState>("evaluating");
  // log entries...
  const [logLines, setLogLines] = useState<LogEntry[]>([]);
  // cached incomplete command
  const incompleteCommandRef = useRef<string | null>(null);

  const kernelRef = useRef<Promise<Kernel.IKernelConnection> | null>(null);
  const [kernel, setKernel] = useState<Kernel.IKernelConnection | null>(null);
  const getKernel = useCallback((): Promise<Kernel.IKernelConnection> => {
    if (!kernelRef.current) {
      kernelRef.current = startKernel(kernelManager, "pykernel-dls")
        .then((kernel) => {
          setKernel(kernel);
          setKerneStatus("ready");
          return kernel;
        })
        .catch((err) => {
          setKerneStatus("error");
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

  useEffect(() => {
    switch (kernelStatus) {
      case "error":
        setLogLines((prev) => [
          ...prev,
          { kind: "error", message: "Error connecting to kernel" },
        ]);
        setPromptState("unavailable");
        break;
      case "connecting":
        setLogLines((prev) => [
          ...prev,
          {
            kind: "result",
            message: "Connecting to kernel...",
          },
        ]);
        setPromptState("unavailable");
        break;
      case "ready":
        setLogLines((prev) => [
          ...prev,
          {
            kind: "result",
            message: "Connected.",
          },
        ]);
        setPromptState("ready");
        break;
    }
  }, [kernelStatus]);

  const appendEntry = useCallback(
    (message: string, category: "command" | "result" | "error") => {
      const logEntry: LogEntry = {
        kind: category,
        message,
        // note that 'partial' for the log means something a little different than for me:
        // for the log it will determine the prefix for a command (e.g. >>> vs ...),
        // but the initial line of a multi-line block will still want to show >>>
        partial: !(incompleteCommandRef.current === null),
      };
      setLogLines((prev) => [...prev, logEntry]);
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
        setPromptState("continuation");
        return;
      }

      // The command is complete; stop accumulating
      incompleteCommandRef.current = null;

      setPromptState("evaluating");
      try {
        await executeCode(kernel, command, (chunk) => {
          const cat = chunk.kind === "error" ? "error" : "result";
          appendEntry(chunk.text, cat);
        });
      } catch (err) {
        appendEntry(
          `${err instanceof Error ? err.message : String(err)}`,
          "error",
        );
      } finally {
        setPromptState("ready");
      }
    },
    [appendEntry, getKernel],
  );

  const props: Props = {
    lines: logLines,
    placeholder: "Enter command...",
    onSubmit: handleCommand,
    interrupt: interruptKernel,
    kernel,
    promptState,
    kernelStatus,
  };
  return <ComponentLayout {...props} />;
};

type Props = {
  lines: LogEntry[];
  placeholder: string;
  onSubmit: CommandHandler;
  interrupt: () => void;
  kernel: Kernel.IKernelConnection | null;
  promptState?: CommandPromptState;
  kernelStatus: KernelStatus;
};

function ComponentLayout(props: Props) {
  return (
    <Paper
      square
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Log lines={props.lines} />
      <CommandPrompt
        placeholder={props.placeholder}
        onSubmit={props.onSubmit}
        status={props.promptState}
        interrupt={props.interrupt}
        kernel={props.kernel}
      />
    </Paper>
  );
}

/** This is really just a fallback... the console should not be rendered in a public page */
function UnauthenticatedPlaceholder() {
  return (
    <ComponentLayout
      placeholder="You must log in first"
      kernel={null}
      kernelStatus="error"
      promptState="unavailable"
      onSubmit={() => {}}
      interrupt={() => {}}
      lines={[]}
    />
  );
}
