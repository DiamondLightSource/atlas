import { Box, Typography } from "@mui/material";
import { ImagePlot } from "@diamondlightsource/davidia";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useMemo, useState, type ComponentProps } from "react";
import { useSpectroscopyData, type DataChannels } from "./useSpectroscopyData";
import { DataSource } from "./dataSource";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
export type SpectroscopyData = Partial<Record<ChannelKey, PlotValues>>;

// ---------------------------------------------------------------------------
// Data source -> channel mapping
// ---------------------------------------------------------------------------

const SOURCE_CHANNELS: Record<
  DataSource,
  Record<ChannelKey, keyof DataChannels>
> = {
  [DataSource.Camera]: {
    red: "cameraRed",
    green: "cameraGreen",
    blue: "cameraBlue",
  },
  [DataSource.Diodes]: {
    red: "diodesRed",
    green: "diodesGreen",
    blue: "diodesBlue",
  },
};

function selectChannels(
  data: DataChannels | null | undefined,
  dataSource: DataSource,
): SpectroscopyData {
  if (!data) return {};
  const mapping = SOURCE_CHANNELS[dataSource];
  return {
    red: data[mapping.red],
    green: data[mapping.green],
    blue: data[mapping.blue],
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpectroscopyPlotsProps {
  dataSource: DataSource;
  expanded: boolean;
  plotAspectRatio: number | "auto" | "equal";
}

function SpectroscopyPlots({
  dataSource,
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { data } = useSpectroscopyData();
  const channels = useMemo(
    () => selectChannels(data, dataSource),
    [data, dataSource],
  );
  const { width, containerRef, mounted } = useContainerWidth();

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------

  const totalRows = 10;
  const rowsPerPlot = expanded ? totalRows / 2 : totalRows;
  const w = 1;
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
  // Layout: 3x1 collapsed, 2x2 expanded
  // -------------------------------------------------------------------------
  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: rowsPerPlot, static: true },
    { i: "1", x: 1, y: 0, w: w, h: rowsPerPlot, static: true },
    {
      i: "2",
      x: expanded ? 0 : 2,
      y: expanded ? rowsPerPlot : 0,
      w: w,
      h: rowsPerPlot,
      static: true,
    },
  ];

  // -------------------------------------------------------------------------
  // Views
  // -------------------------------------------------------------------------
  const views = CHANNELS.map(({ key }) => {
    const values = channels[key];
    if (!values) return null;
    return (
      <ImagePlot
        aspect={plotAspectRatio}
        plotConfig={{}}
        customToolbarChildren={null}
        values={values}
        //tightAxes //requires Davidia 1.1.0
      />
    );
  });

  const titles = CHANNELS.map(({ label }) => label);

  // -------------------------------------------------------------------------
  // Plot cells
  // -------------------------------------------------------------------------
  const plots = views.map((view, i) => (
    <Box
      key={i}
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
        {titles[i]}
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
        {view}
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
            cols: expanded ? 2 : 3,
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
