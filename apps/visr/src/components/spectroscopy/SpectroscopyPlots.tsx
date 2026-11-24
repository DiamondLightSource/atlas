import { Box, Typography, useColorScheme } from "@mui/material";
import { ImagePlot } from "@diamondlightsource/davidia";
import { ReactGridLayout } from "react-grid-layout";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  DEFAULT_STRIPES,
  stripesOn,
  useSpectroscopyData,
  type DataChannels,
  type PlotKind,
  type Rgb,
  type StripeColours,
} from "./useSpectroscopyData";
import { beamWarning } from "./plotKinds";
import { DataSource } from "./dataSource";
import type { LastPointsStatus } from "../ScanStatusLine";
import CamPva from "../CamPva";
import type { Cell } from "../cell";
import { PlotCell } from "../PlotCell";
import {
  ONE_COLUMN_BELOW,
  PLOT_GRID_SPACING,
  ROWS_PER_PLOT,
  gridHeightFor,
  minimumRowHeightFor,
  rowHeightFor,
} from "../plotGrid";
import { useElementSize } from "../../hooks/useElementSize";

const OVERVIEW_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-04:PVA:OUTPUT";

const CHANNELS = [
  { key: "red", label: "Red" },
  { key: "green", label: "Green" },
  { key: "blue", label: "Blue" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
type ImageKey = ChannelKey | "composite";
export type SpectroscopyData = Partial<Record<ImageKey, PlotValues>>;

// ---------------------------------------------------------------------------
// Data source -> channel mapping
// ---------------------------------------------------------------------------

const SOURCE_CHANNELS: Record<
  DataSource,
  Record<
    ImageKey,
    `${"camera" | "diodes"}${"Red" | "Green" | "Blue" | "Composite"}`
  >
> = {
  [DataSource.Camera]: {
    red: "cameraRed",
    green: "cameraGreen",
    blue: "cameraBlue",
    composite: "cameraComposite",
  },
  [DataSource.Diodes]: {
    red: "diodesRed",
    green: "diodesGreen",
    blue: "diodesBlue",
    composite: "diodesComposite",
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
    composite: data[mapping.composite],
  };
}

// ---------------------------------------------------------------------------
// A remark about the plots themselves, in one quiet line under them
// ---------------------------------------------------------------------------

/** Over the plots' bottom-left corner, so it takes no room from them */
function PlotNote({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        position: "absolute",
        left: 24,
        bottom: 8,
        px: 1,
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      {note}
    </Typography>
  );
}

// ---------------------------------------------------------------------------
// Empty-cell stripes in the colours of the page behind the plots
// ---------------------------------------------------------------------------

/**
 * The background colour seen at `element`: the backgrounds at and above it,
 * see-through ones blended over the first opaque one. Null if none is opaque.
 */
function backgroundBehind(element: HTMLElement | null): Rgb | null {
  const layers: number[][] = [];
  for (let el = element; el; el = el.parentElement) {
    const parts = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!parts || parts.length < 3) continue;
    const [r, g, b, a = 1] = parts.map(Number);
    if (a <= 0) continue;
    if (a >= 1) {
      // blend the see-through layers over this one, innermost last
      return layers.reduceRight<Rgb>(
        (under, [lr, lg, lb, la]) => [
          under[0] * (1 - la) + lr * la,
          under[1] * (1 - la) + lg * la,
          under[2] * (1 - la) + lb * la,
        ],
        [r, g, b],
      );
    }
    layers.push([r, g, b, a]);
  }
  return null;
}

/**
 * Stripes matching the background behind `element`, read again when the
 * colour scheme changes (after the browser has applied it)
 */
function useStripesBehind(
  element: React.RefObject<HTMLElement | null>,
  /** Whether `element` is rendered yet */
  ready: boolean,
): StripeColours {
  const { mode, systemMode } = useColorScheme();
  const scheme = mode === "system" ? systemMode : mode;
  const [background, setBackground] = useState<string | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const found = backgroundBehind(element.current);
      if (found) setBackground(found.join(","));
    });
    return () => cancelAnimationFrame(frame);
  }, [element, scheme, ready]);
  return useMemo(
    () =>
      background
        ? stripesOn(background.split(",").map(Number) as unknown as Rgb)
        : DEFAULT_STRIPES,
    [background],
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpectroscopyPlotsProps {
  dataSource: DataSource;
  plotKind: PlotKind;
  paneOpen: boolean;
  plotAspectRatio: number | "auto" | "equal";
  /** Told whether the last points are in, for the scan status */
  onLastPointsChange?: (lastPoints: LastPointsStatus | null) => void;
}

function SpectroscopyPlots({
  dataSource,
  plotKind,
  paneOpen,
  plotAspectRatio,
  onLastPointsChange,
}: SpectroscopyPlotsProps) {
  // measured before the first paint, so the cards never show at a guessed size
  const { ref: containerRef, size } = useElementSize();
  const mounted = size !== null;
  const width = size?.width ?? 0;
  const containerHeight = size?.height ?? 0;
  // the stripes match the cells' background, so are read from inside one
  const cellContent = useRef<HTMLDivElement>(null);
  const stripes = useStripesBehind(cellContent, mounted);
  const { data, lastPoints } = useSpectroscopyData(plotKind, stripes);
  useEffect(() => {
    onLastPointsChange?.(lastPoints);
  }, [lastPoints, onLastPointsChange]);
  const channels = useMemo(
    () => selectChannels(data, dataSource),
    [data, dataSource],
  );

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------

  // Pane open: overview across the top, 3 channels + composite in 2x2 below
  // Pane collapsed: 3 channels + composite in 2x2
  // Narrow: all in one column, scrolling
  const oneColumn = width > 0 && width < ONE_COLUMN_BELOW;
  const cols = oneColumn ? 1 : 2;
  const plotRows = oneColumn ? (paneOpen ? 5 : 4) : paneOpen ? 3 : 2;
  const rowsPerPlot = ROWS_PER_PLOT;
  const totalRows = plotRows * rowsPerPlot;
  const minimumRowHeight = minimumRowHeightFor(oneColumn);
  const minimumGridHeight = minimumRowHeight * totalRows;

  const rowHeight =
    containerHeight > 0
      ? Math.max(rowHeightFor(containerHeight, totalRows), minimumRowHeight)
      : minimumRowHeight;
  const gridHeight = gridHeightFor(rowHeight, totalRows);

  // -------------------------------------------------------------------------
  // Cells
  // -------------------------------------------------------------------------
  const overviewCell: Cell = {
    key: "overview",
    title: "Overview",
    content: <CamPva src={OVERVIEW_SRC} alt="DCAM-01" />,
  };

  const plot = (values: PlotValues | undefined) =>
    values ? (
      <ImagePlot
        aspect={plotAspectRatio}
        plotConfig={{ xValues: data.xValues, yValues: data.yValues }}
        customToolbarChildren={null}
        values={values}
        tightAxes
      />
    ) : null;

  const channelCells: Cell[] = CHANNELS.map(({ key, label }) => ({
    key,
    title: label,
    content: plot(channels[key]),
  }));

  // Not computed yet: empty cells on the same axes as the channels
  const compositeCell: Cell = {
    key: "composite",
    title: "Composite",
    content: plot(channels.composite),
  };

  const cells = paneOpen
    ? [overviewCell, ...channelCells, compositeCell]
    : [...channelCells, compositeCell];

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  const layout = cells.map(({ key }, i) => {
    const size = { i: key, h: rowsPerPlot, static: true };
    // the overview, when shown, takes the whole top row
    if (key === "overview") return { ...size, x: 0, y: 0, w: cols };
    const j = paneOpen ? i - 1 : i;
    const row = Math.floor(j / cols) + (paneOpen ? 1 : 0);
    return { ...size, x: j % cols, y: row * rowsPerPlot, w: 1 };
  });

  // -------------------------------------------------------------------------
  // Plot cells
  // -------------------------------------------------------------------------
  const plots = cells.map(({ key, title, content }) => (
    <div key={key}>
      <PlotCell
        title={title}
        contentRef={key === "red" ? cellContent : undefined}
        balanceAxes={key !== "overview"}
        largeTitle={!paneOpen}
      >
        {content}
      </PlotCell>
    </div>
  ));

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        flex: "1 1 0",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        minHeight: 0,
        position: "relative",
      }}
    >
      <Box
        ref={containerRef! as React.RefObject<HTMLDivElement>}
        sx={{
          flex: "1 1 0",
          width: "100%",
          minWidth: 0,
          height: gridHeight,
          minHeight: minimumGridHeight,
          overflow: "visible",
          // react-grid-layout places its cells with position: absolute, and
          // only its stylesheet (not imported) makes the grid their
          // container. Without this they're placed against something
          // further up the page, outside the scrolling plot column
          position: "relative",
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
              ...PLOT_GRID_SPACING,
            }}
            autoSize
            onLayoutChange={() => {}}
          >
            {plots}
          </ReactGridLayout>
        )}
      </Box>
      <PlotNote note={beamWarning(plotKind, data.beam)} />
    </Box>
  );
}

export default SpectroscopyPlots;
