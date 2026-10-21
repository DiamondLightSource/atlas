import { Box, Typography } from "@mui/material";
import { ImagePlot } from "@diamondlightsource/davidia";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import {
  useLayoutEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useSpectroscopyData } from "./useSpectroscopyData";
import CamPva from "../CamPva";

const CAMERA_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-04:PVA:OUTPUT";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
export type SpectroscopyData = Partial<Record<ChannelKey, PlotValues>>;

interface Cell {
  key: string;
  title: string;
  content: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpectroscopyPlotsProps {
  expanded: boolean;
  plotAspectRatio: number | "auto" | "equal";
}

function SpectroscopyPlots({
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { data: channels } = useSpectroscopyData();
  const { width, containerRef, mounted } = useContainerWidth();

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------

  const totalRows = 10;
  const rowsPerPlot = expanded ? totalRows / 2 : totalRows;
  const cols = expanded ? 2 : 5;
  const minimumRowHeight = 20;
  const minimumGridHeight = minimumRowHeight * totalRows;
  const [containerHeight, setContainerHeight] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  const rowHeight =
    containerHeight > 0
      ? Math.max(containerHeight / totalRows, minimumRowHeight)
      : expanded
        ? minimumRowHeight
        : 50;
  const gridHeight = rowHeight * totalRows;

  // -------------------------------------------------------------------------
  // Cells
  // -------------------------------------------------------------------------
  const cameraCell: Cell = {
    key: "overview",
    title: "Overview",
    content: <CamPva src={CAMERA_SRC} alt="DCAM-01" />,
  };

  const channelCells: Cell[] = CHANNELS.map(({ key, label }) => ({
    key,
    title: label,
    content: (
      <ImagePlot
        aspect={plotAspectRatio}
        plotConfig={{}}
        customToolbarChildren={null}
        values={channels[key]}
        //tightAxes //requires Davidia 1.1.0
      />
    ),
  }));

  // Placeholder for the composite image
  const compositeCell: Cell = {
    key: "composite",
    title: "Composite image",
    content: null,
  };

  // Drawer open: camera + 3 channels + composite in one row (5x1)
  // Drawer closed: 3 channels + composite in a 2x2
  const cells = expanded
    ? [...channelCells, compositeCell]
    : [cameraCell, ...channelCells, compositeCell];

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  const layout = cells.map(({ key }, i) => ({
    i: key,
    x: i % cols,
    y: Math.floor(i / cols) * rowsPerPlot,
    w: 1,
    h: rowsPerPlot,
    static: true,
  }));

  // -------------------------------------------------------------------------
  // Plot cells
  // -------------------------------------------------------------------------
  const plots = cells.map(({ key, title, content }) => (
    <Box
      key={key}
      sx={{
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="overline"
        color="primary"
        borderBottom={1}
        borderColor={"divider"}
        marginLeft={2}
        flexShrink={0}
      >
        {title}
      </Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          // davidia wraps every plot in a hardcoded
          // <div style="display:grid;position:relative"> with no height,
          // which breaks the size chain. This gives it one.
          "& > div": { height: "100%" },
        }}
      >
        {content}
      </Box>
    </Box>
  ));

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box
      ref={containerRef! as React.RefObject<HTMLDivElement>}
      sx={{
        flex: "1 1 0",
        width: "100%",
        minWidth: 0,
        height: gridHeight,
        minHeight: minimumGridHeight,
        overflow: "visible",
      }}
    >
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          style={{ height: gridHeight }}
          gridConfig={{
            cols: cols,
            rowHeight: rowHeight,
            margin: [0, 0],
          }}
          autoSize
          onLayoutChange={() => {}}
        >
          {plots}
        </ReactGridLayout>
      )}
    </Box>
  );
}

export default SpectroscopyPlots;
