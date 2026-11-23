import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * The size of the element `ref` is put on, known before anything is painted.
 *
 * react-grid-layout's useContainerWidth starts from a guessed width and puts
 * off each new one to the next animation frame, so a grid sized by it is
 * painted at the wrong size first, then jumps. This measures in a layout
 * effect, before the first paint, and re-renders at once on a resize: a
 * ResizeObserver runs after layout but before paint, and flushSync makes the
 * re-render happen there too.
 *
 * `size` is null until measured: render nothing sized by it till then.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = (width: number, height: number) =>
      setSize(current =>
        current?.width === width && current.height === height
          ? current
          : { width, height },
      );

    const { width, height } = element.getBoundingClientRect();
    measure(width, height);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      flushSync(() => measure(width, height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
