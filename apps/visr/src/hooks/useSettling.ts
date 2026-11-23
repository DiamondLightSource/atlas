import { useEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/** How long nothing may resize for before the layout counts as settled */
const QUIET_MS = 50;
/** Give up waiting after this long without a window resize, in case something keeps resizing */
const MAX_MS = 600;

/** What resizes on its own after a layout change: the grid cells, davidia's
 * aspect-ratio wrappers, and the canvases react-three-fiber sizes */
const WATCHED = ".react-grid-item, .react-grid-item > div div, canvas";

/**
 * Whether the plots under `container` are still resizing after `key` changed,
 * or while the window is being resized.
 *
 * Several layers below a layout change (the grid's width, davidia's
 * tightAxes, the canvases) each measure and re-render a frame or more after
 * the one above, so the plots jump about before settling. Hide them while
 * this is true. It is true from the very render in which `key` changes, or
 * from the first window resize event, so no in-between frame is painted, and
 * stays true until nothing under `container` has resized for a short while.
 */
export function useSettling(
  key: unknown,
  container: RefObject<HTMLElement | null>,
): boolean {
  const [settledKey, setSettledKey] = useState(key);
  const [windowResizing, setWindowResizing] = useState(false);
  const settling = !Object.is(key, settledKey) || windowResizing;

  // Hide as soon as a window resize starts; flushed so the hiding is painted
  // in the same frame as the first resize
  useEffect(() => {
    if (windowResizing) return;
    const start = () => flushSync(() => setWindowResizing(true));
    window.addEventListener("resize", start);
    return () => window.removeEventListener("resize", start);
  }, [windowResizing]);

  useEffect(() => {
    if (!settling) return;
    const settle = () => {
      setSettledKey(key);
      setWindowResizing(false);
    };
    let quiet = setTimeout(settle, QUIET_MS);
    let max = setTimeout(settle, MAX_MS);
    const stillResizing = () => {
      clearTimeout(quiet);
      quiet = setTimeout(settle, QUIET_MS);
    };
    // a drag keeps the plots hidden for as long as it goes on
    const windowResized = () => {
      stillResizing();
      clearTimeout(max);
      max = setTimeout(settle, MAX_MS);
    };

    const observer = new ResizeObserver(stillResizing);
    const root = container.current;
    if (root) {
      observer.observe(root);
      root.querySelectorAll(WATCHED).forEach(el => observer.observe(el));
    }
    window.addEventListener("resize", windowResized);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", windowResized);
      clearTimeout(quiet);
      clearTimeout(max);
    };
  }, [settling, key, container]);

  return settling;
}
