import { Box, Typography } from "@mui/material";
import type { ReactNode, Ref } from "react";

interface PlotCellProps {
  title: string;
  children: ReactNode;
  /** On the content area, whose background the plot sits on */
  contentRef?: Ref<HTMLDivElement>;
  /** Pad the right to match a davidia plot's wider left axis margin, so its image sits centred */
  balanceAxes?: boolean;
  /** A much bigger title, for when the plots have the room: the controls pane closed */
  largeTitle?: boolean;
}

// davidia's axis margins with no y-axis label: 80px left, 24px right
const AXIS_MARGIN_DIFFERENCE = 80 - 24;
// Of davidia's 16px top margin, what is empty: the rest leaves room for the
// top y tick label, which sits half above the axis
const AXIS_TOP_SPARE = 10;

/** A plot on a shaded card, titled inside it */
export function PlotCell({
  title,
  children,
  contentRef,
  balanceAxes = false,
  largeTitle = false,
}: PlotCellProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant={largeTitle ? "h4" : "subtitle2"}
        color="text.secondary"
        noWrap
        sx={{
          px: largeTitle ? 2 : 1.5,
          pt: largeTitle ? 1.25 : 0.75,
          pb: largeTitle ? 0 : 0.25,
          flexShrink: 0,
        }}
      >
        {title}
      </Typography>
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          px: 0.5,
          pb: 0.5,
          // davidia wraps every plot in a hardcoded
          // <div style="display:grid;position:relative"> with no height,
          // which breaks the size chain. This gives it one.
          // With tightAxes that div also takes an aspect ratio, so it is
          // narrower than the cell: the auto margins centre it.
          // minWidth/minHeight 0 keep its contents from holding it open: davidia
          // sets them on tightAxes plots, but not on others, like heatmaps
          "& > div": {
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            marginInline: "auto",
          },
          ...(balanceAxes && {
            pr: theme =>
              `calc(${theme.spacing(0.5)} + ${AXIS_MARGIN_DIFFERENCE}px)`,
            // davidia's own bottom margin already spaces the tick labels
            pb: 0,
            // up into the empty top of davidia's margin, under the title
            "& > div": {
              height: `calc(100% + ${AXIS_TOP_SPARE}px)`,
              marginTop: `-${AXIS_TOP_SPARE}px`,
              marginInline: "auto",
            },
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default PlotCell;
