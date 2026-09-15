import { Box, Typography } from "@mui/material";
import { ImagePlot, type NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useState, type ComponentProps } from "react";
import { useSpectroscopyData, type RGBColour } from "./useSpectroscopyData";

// ---------------------------------------------------------------------------
// Helpers: data conversion
// ---------------------------------------------------------------------------

function toNDT(matrix: (number | null)[][], colour: RGBColour): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return EMPTY_NDT; // skip invalid input
  }
  const height = matrix.length;
  const width = matrix[0].length;

  // Flatten and filter out nulls for normalisation
  const flat = matrix.flat();
  const valid = flat.filter((v): v is number => v !== null && !isNaN(v));

  // Avoid crashes when no valid values
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 1;
  const scale = max > min ? 255 / (max - min) : 1;

  const rgb = new Uint8Array(width * height * 3);

  for (let i = 0; i < flat.length; i++) {
    const v = flat[i];
    let scaled = 0;
    if (v !== null && !isNaN(v)) {
      scaled = Math.round((v - min) * scale);
    } // else stays 0 (black)

    switch (colour) {
      case "red":
        rgb[i * 3] = scaled;
        break;
      case "green":
        rgb[i * 3 + 1] = scaled;
        break;
      case "blue":
        rgb[i * 3 + 2] = scaled;
        break;
      case "gray":
        rgb[i * 3] = scaled;
        rgb[i * 3 + 1] = scaled;
        rgb[i * 3 + 2] = scaled;
        break;
    }
  }

  return ndarray(rgb, [height, width, 3]) as NDT;
}

/** Placeholder empty gray dataset */
const EMPTY_NDT = toNDT([[0]], "gray");

// ---------------------------------------------------------------------------
// Helpers: data fetching
// ---------------------------------------------------------------------------

/** Return type of `/api/data/map` */
interface MapResponse {
  values: (number | null)[][];
}

async function fetchMap(
  filepath: string,
  datapath: string,
  colour: RGBColour,
  snake: boolean,
) {
  const url = `/api/data/map?filepath=${encodeURIComponent(filepath)}&datapath=${encodeURIComponent(datapath)}&snake=${encodeURIComponent(snake)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(resp.statusText);
  const mapResponse: MapResponse = await resp.json();
  return toNDT(mapResponse.values, colour);
}

// ---------------------------------------------------------------------------
// Channel definitions
// ---------------------------------------------------------------------------

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
  //{ key: "gray", label: "Gray channel" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
export type SpectroscopyData = Partial<Record<ChannelKey, PlotValues>>;

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
  const { data: channels } = useSpectroscopyData(fetchMap);
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
  const views = CHANNELS.map(({ key }) => (
    <ImagePlot
      aspect={plotAspectRatio}
      plotConfig={{}}
      customToolbarChildren={null}
      values={channels[key] ?? EMPTY_NDT}
      //tightAxes //requires Davidia 1.1.0
    />
  ));

  const titles = CHANNELS.map(({ label }) => label);

  // -------------------------------------------------------------------------
  // Plot cells
  // -------------------------------------------------------------------------
  const plots = views.map((view, i) => (
    <Box
      key={i}
      sx={{
        width: "100%",
        height: "100%",
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
