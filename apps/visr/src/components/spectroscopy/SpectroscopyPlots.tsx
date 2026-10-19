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
  type Rgb,
  type StripeColours,
} from "./useSpectroscopyData";
import { DataSource } from "./dataSource";
import {
  SCAN_STATUS_BUSY,
  SCAN_STATUS_TEXT,
  type ScanStatus,
} from "./scanStatus";

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

function ScanStatusLine({ status }: { status: ScanStatus | null }) {
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
  expanded: boolean;
  plotAspectRatio: number | "auto" | "equal";
}

function SpectroscopyPlots({
  dataSource,
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const stripes = useStripesBehind(
    containerRef as React.RefObject<HTMLElement | null>,
  );
  const { data, status } = useSpectroscopyData(stripes);
  const channels = useMemo(
    () => selectChannels(data, dataSource),
    [data, dataSource],
  );

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
        plotConfig={{ xValues: data.xValues, yValues: data.yValues }}
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
      <ScanStatusLine status={status} />
    </Box>
  );
}

export default SpectroscopyPlots;
