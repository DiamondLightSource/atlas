import { Box } from "@mui/material";
import { ReactGridLayout } from "react-grid-layout";
import SliceViewer from "./SliceViewer";
import VolumeRenderer from "./VolumeRenderer";
import { Plane } from "./plane";
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
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-01:PVA:OUTPUT";

/** Pane collapsed, the three plots side by side get no narrower than this: below it, one goes across the top and two below */
const MIN_ROW_PLOT_WIDTH = 260;

const DETECTOR_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-05:PVA:OUTPUT";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  /** Not yet loaded: the reconstruction and slice cells are empty */
  volumeData?: Uint8Array;
  volumeShape?: [number, number, number];
  paneOpen: boolean;
  volumeVisible: boolean;
  slice: number;
  plane: Plane;
  threshold: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TomographyPlots({
  volumeData,
  volumeShape,
  plane,
  slice,
  threshold,
  paneOpen,
}: Props) {
  // measured before the first paint, so the cards never show at a guessed size
  const { ref: containerRef, size } = useElementSize();
  const mounted = size !== null;
  const width = size?.width ?? 0;
  const containerHeight = size?.height ?? 0;

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------
  // Pane open: overview + 3 plots in 2x2
  // Pane collapsed: 3 plots in a row; or, too narrow for that, the first
  // across the top and the other two side by side below
  // Narrow: all in one column, scrolling
  const plotCount = paneOpen ? 4 : 3;
  const oneColumn = width > 0 && width < ONE_COLUMN_BELOW;
  const split = !paneOpen && !oneColumn && width < 3 * MIN_ROW_PLOT_WIDTH;
  const cols = oneColumn ? 1 : paneOpen || split ? 2 : 3;
  const rowsPerPlot = ROWS_PER_PLOT;
  const h = Math.ceil(plotCount / cols) * rowsPerPlot;
  const minimumRowHeight = minimumRowHeightFor(oneColumn);
  const minimumGridHeight = minimumRowHeight * h;

  const rowHeight =
    containerHeight > 0
      ? Math.max(rowHeightFor(containerHeight, h), minimumRowHeight)
      : minimumRowHeight;
  const gridHeight = gridHeightFor(rowHeight, h);

  // -------------------------------------------------------------------------
  // Cells
  // -------------------------------------------------------------------------
  const volume =
    volumeData && volumeShape ? { data: volumeData, shape: volumeShape } : null;

  const overviewCell: Cell = {
    key: "overview",
    title: "Overview",
    content: <CamPva src={OVERVIEW_SRC} alt="Overview camera" />,
  };

  const plotCells: Cell[] = [
    {
      key: "detector",
      title: "Detector",
      content: <CamPva src={DETECTOR_SRC} alt="Detector camera" />,
    },
    {
      key: "reconstruction",
      title: "Reconstruction",
      content: volume && (
        <VolumeRenderer
          volumeData={volume.data}
          volumeShape={volume.shape}
          threshold={threshold / 255}
        />
      ),
    },
    {
      key: "slice",
      title: "Cross-section",
      content: volume && (
        <SliceViewer
          volumeData={volume.data}
          volumeShape={volume.shape}
          slice={slice}
          plane={plane}
          threshold={threshold}
          colourBar={false}
        />
      ),
    },
  ];

  const cells = paneOpen ? [overviewCell, ...plotCells] : plotCells;

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  const layout = cells.map(({ key }, i) => {
    const size = { i: key, h: rowsPerPlot, static: true };
    // split: the first takes the whole top row, the rest go below it
    if (split && i === 0) return { ...size, x: 0, y: 0, w: cols };
    const j = split ? i + 1 : i;
    return {
      ...size,
      x: j % cols,
      y: Math.floor(j / cols) * rowsPerPlot,
      w: 1,
    };
  });

  // -------------------------------------------------------------------------
  // Plot cells
  // -------------------------------------------------------------------------
  const plots = cells.map(({ key, title, content }) => (
    <div key={key}>
      <PlotCell
        title={title}
        largeTitle={!paneOpen}
        // the cross-section is a davidia plot like spectroscopy's: aligned
        // the same way
        balanceAxes={key === "slice"}
      >
        {content}
      </PlotCell>
    </div>
  ));

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  // The outer box takes the column's height and no more: the grid's minimum
  // height is on the inner one, so stacked plots overflow and the column
  // scrolls, rather than the whole page growing
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
    </Box>
  );
}

export default TomographyPlots;
