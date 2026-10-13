// For now only uses the Kernel's own completion protocol, but eventually this would know about e.g. our device names

import type { Kernel } from "@jupyterlab/services";
import { useCallback, useRef, useState } from "react";

type Completion = {
  matches: string[];
  cursorStart: number;
  cursorEnd: number;
};

export function usePythonCompletion(kernel: Kernel.IKernelConnection | null) {
  const [completion, setCompletion] = useState<Completion | null>(null);

  const requestId = useRef(0);

  const complete = useCallback(
    async (code: string, cursorPosition: number) => {
      const id = ++requestId.current;

      if (!kernel || !code) {
        setCompletion(null);
        return;
      }

      try {
        const reply = await kernel.requestComplete({
          code,
          cursor_pos: cursorPosition,
        });

        // Ignore replies to older requests
        if (id !== requestId.current) return;

        const result = reply.content;

        if (result.status !== "ok") {
          setCompletion(null);
          return;
        }

        setCompletion({
          matches: result.matches,
          cursorStart: result.cursor_start,
          cursorEnd: result.cursor_end,
        });
      } catch {
        if (id === requestId.current) {
          setCompletion(null);
        }
      }
    },
    [kernel],
  );

  const dismiss = useCallback(() => {
    ++requestId.current;
    setCompletion(null);
  }, []);

  return { completion, complete, dismiss };
}
