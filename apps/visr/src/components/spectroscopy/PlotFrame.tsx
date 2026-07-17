import { Box } from "@mui/material";
import { Children, type ReactNode } from "react";

const DEFAULT_GAP_PX = 8;
const TEST_BGCOLOR = "#ff000033";

export interface PlotFrameProps {
  /** Drives the layout: `true` → contained 2x2 grid, `false` → single filling row. */
  expanded: boolean;
  /** Plot elements to lay out. */
  children: ReactNode;
  /** Cell aspectRatio ratio as a CSS `aspectRatio-ratio` string, e.g. `"4 / 3"`. */
  aspectRatio: string;
  /** Gap between cells, in pixels. */
  gap?: number;
  /** Cell background colour (any CSS colour). */
  bgcolor?: string;
}

/**
 * Lays out plot children in one of two states:
 *   - expanded:  a contained 2x2 grid — every cell keeps aspectRatio ratio and the
 *                whole grid fits inside its parent, leaving dead space if needed.
 *   - collapsed: a single row that fills the width; the height follows the ratio
 *                and the root is content-height, so a sibling (e.g. a drawer)
 *                can take the remaining space.
 *
 * Layout-only and plot-agnostic: pass already-created plot elements as children.
 */
export default function PlotFrame({
  expanded,
  children,
  aspectRatio,
  gap = DEFAULT_GAP_PX,
  bgcolor = TEST_BGCOLOR,
}: PlotFrameProps) {
  const [rw, rh] = aspectRatio.split("/").map(n => parseFloat(n));
  const ar = rw / rh;

  // (expanded only): clamp the cell by the width fit and the height fit.
  const cellW = `min((100cqw - ${gap}px) / 2, ${ar} * (100cqh - ${gap}px) / 2)`;
  const cellH = `min((100cqh - ${gap}px) / 2, (100cqw - ${gap}px) / (2 * ${ar}))`;

  const cellSizeSx = expanded
    ? { width: cellW, height: cellH }
    : { flex: 1, aspectRatio };

  return (
    <Box
      sx={
        expanded
          ? {
              width: "100%",
              height: "100%",
              containerType: "size",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }
          : { width: "100%" }
      }
    >
      <Box
        sx={
          expanded
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(2, auto)",
                gridTemplateRows: "repeat(2, auto)",
                gap: `${gap}px`,
              }
            : {
                display: "flex",
                flexDirection: "row",
                width: "100%",
                gap: `${gap}px`,
              }
        }
      >
        {Children.map(children, child => (
          // Outer cell: layout-sized only. Its size comes purely from cellSizeSx,
          // never from the plot's content.
          <Box
            sx={{
              ...cellSizeSx,
              position: "relative",
              overflow: "hidden",
              minWidth: 0,
              minHeight: 0,
              bgcolor,
            }}
          >
            {/* Absolute fill: matches the cell exactly and is out of flow, so the
                h5web canvas inside can't feed its size back into the cell. */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                minWidth: 0,
                minHeight: 0,
              }}
            >
              {child}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
