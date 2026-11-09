import {
  Box,
  CircularProgress,
  Fade,
  Typography,
  useColorScheme,
} from "@mui/material";
import { ImagePlot } from "@diamondlightsource/davidia";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
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
import {
  SCAN_STATUS_BUSY,
  SCAN_STATUS_TEXT,
  type ScanStatus,
} from "./scanStatus";
import CamPva from "../CamPva";
import type { Cell } from "../cell";

const OVERVIEW_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-04:PVA:OUTPUT";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
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
// Scan status: one quiet line under the plots, at the right
// ---------------------------------------------------------------------------

const STATUS_COLOUR: Record<ScanStatus, string> = {
  scanning: "text.secondary",
  loadingLastPoints: "text.secondary",
  complete: "text.secondary",
  lastPointsMissing: "warning.main",
  failed: "error.main",
};

/** "Scan complete" fades out after this long; problems stay */
const COMPLETE_SHOWN_MS = 3000;
const FADE_MS = 1000;

/** One status's text; remounted when the status changes, so a fade starts afresh */
function ScanStatusText({ status }: { status: ScanStatus }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    if (status !== "complete") return;
    const timer = setTimeout(() => setShown(false), COMPLETE_SHOWN_MS);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <Fade in={shown} timeout={FADE_MS} appear={false}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {SCAN_STATUS_BUSY.has(status) && (
          <CircularProgress size={10} thickness={5} color="inherit" />
        )}
        <Typography variant="caption" color={STATUS_COLOUR[status]}>
          {SCAN_STATUS_TEXT[status]}
        </Typography>
      </Box>
    </Fade>
  );
}

function ScanStatusLine({
  status,
  note,
}: {
  status: ScanStatus | null;
  /** A remark about the plots themselves, on the left */
  note?: string | null;
}) {
  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        minHeight: 20,
        px: 1,
        flexShrink: 0,
      }}
    >
      {note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: "auto", pr: 2 }}
        >
          {note}
        </Typography>
      )}
      {status && <ScanStatusText key={status} status={status} />}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Empty-cell stripes in the colours of the page behind the plots
// ---------------------------------------------------------------------------

/** The first opaque background colour at or above `element`, if any */
function backgroundBehind(element: HTMLElement | null): Rgb | null {
  for (let el = element; el; el = el.parentElement) {
    const parts = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (parts && parts.length >= 3 && (parts.length < 4 || +parts[3] > 0)) {
      return [+parts[0], +parts[1], +parts[2]];
    }
  }
  return null;
}

/**
 * Stripes matching the background behind `element`, read again when the
 * colour scheme changes (after the browser has applied it)
 */
function useStripesBehind(
  element: React.RefObject<HTMLElement | null>,
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
  }, [element, scheme]);
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
  expanded: boolean;
  plotAspectRatio: number | "auto" | "equal";
}

function SpectroscopyPlots({
  dataSource,
  plotKind,
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const stripes = useStripesBehind(
    containerRef as React.RefObject<HTMLElement | null>,
  );
  const { data, status } = useSpectroscopyData(plotKind, stripes);
  const channels = useMemo(
    () => selectChannels(data, dataSource),
    [data, dataSource],
  );

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
        //tightAxes //requires Davidia 1.1.0
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
    title: "Composite image",
    content: plot(channels.composite),
  };

  // Drawer open: camera + 3 channels + composite in one row (5x1)
  // Drawer closed: 3 channels + composite in a 2x2
  const cells = expanded
    ? [...channelCells, compositeCell]
    : [overviewCell, ...channelCells, compositeCell];

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
      sx={{
        flex: "1 1 0",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        minHeight: 0,
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
      <ScanStatusLine status={status} note={beamWarning(plotKind, data.beam)} />
    </Box>
  );
}

export default SpectroscopyPlots;
