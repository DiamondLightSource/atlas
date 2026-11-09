import { useCallback, useRef } from "react";

export function useCommandHistory() {
  const entries = useRef<string[]>([]);
  /** 0 = not browsing; 1 = most recent command */
  const position = useRef(0);

  const at = (p: number) => entries.current[entries.current.length - p] ?? "";

  const push = useCallback((command: string) => {
    entries.current.push(command);
    position.current = 0;
  }, []);

  const older = useCallback(() => {
    if (position.current >= entries.current.length) return undefined;
    position.current += 1;
    return at(position.current);
  }, []);

  const newer = useCallback(() => {
    if (position.current < 1) return undefined;
    position.current -= 1;
    return at(position.current);
  }, []);

  return { push, older, newer };
}
