import type { Theme } from "@mui/material/styles";

// Spacing for grids of PlotCells

/** Space between the plot cells, and at their sides; none above or below, so they run the full height like the controls pane */
export const PLOT_GAP = 8;

/** Grid settings for cells spaced by PLOT_GAP */
export const PLOT_GRID_SPACING = {
  margin: [PLOT_GAP, PLOT_GAP],
  containerPadding: [PLOT_GAP, 0],
} as const;

/** The row height that fits `rows` grid rows, and their gaps, in `height` */
export function rowHeightFor(height: number, rows: number): number {
  return (height - (rows - 1) * PLOT_GAP) / rows;
}

/** The height of `rows` grid rows of `rowHeight`, with their gaps */
export function gridHeightFor(rowHeight: number, rows: number): number {
  return rowHeight * rows + (rows - 1) * PLOT_GAP;
}

/** Below this width, the plots go into one column */
export const ONE_COLUMN_BELOW = 520;

/** Grid rows per plot: fine enough for even splits */
export const ROWS_PER_PLOT = 4;

/** The smallest grid row: plots side by side shrink further than stacked ones, which scroll instead */
export function minimumRowHeightFor(oneColumn: boolean): number {
  return (oneColumn ? 240 : 120) / ROWS_PER_PLOT;
}

/**
 * The theme's quickest transition (150ms), as the controls pane opens and
 * closes; skipped for anyone who has asked for less motion
 */
export function layoutTransition(properties: string[]) {
  return {
    transition: (theme: Theme) =>
      theme.transitions.create(properties, {
        duration: theme.transitions.duration.shortest,
        easing: theme.transitions.easing.easeOut,
      }),
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  } as const;
}

/**
 * Hides the plot cards at once while they settle after a layout change, then
 * fades them back in, rather than showing them jump or move into place
 */
export function settlingSx(settling: boolean) {
  return {
    opacity: settling ? 0 : 1,
    transition: settling ? "none" : "opacity 100ms ease-out",
  } as const;
}
