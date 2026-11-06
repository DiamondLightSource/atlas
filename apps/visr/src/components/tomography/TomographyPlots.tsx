import { Box, Typography } from "@mui/material";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useState, type ReactNode } from "react";
import SliceViewer from "./SliceViewer";
import VolumeRenderer from "./VolumeRenderer";
import { Plane } from "./PlaneEnum";
import CamPva from "../CamPva";

const OVERVIEW_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-01:PVA:OUTPUT";
const DETECTOR_SRC =
  "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-05:PVA:OUTPUT";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  drawerOpen: boolean;
  volumeVisible: boolean;
  slice: number;
  plane: Plane;
  threshold: number;
}

interface Cell {
  key: string;
  title: string;
  content: ReactNode;
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
  drawerOpen,
}: Props) {
  const { width, containerRef, mounted } = useContainerWidth();

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------
  const h = 10;
  const minimumRowHeight = 30;
  const minimumGridHeight = minimumRowHeight * h;
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
      ? Math.max(containerHeight / h, minimumRowHeight)
      : drawerOpen
        ? minimumRowHeight
        : 50;
  const gridHeight = rowHeight * h;

  if (!volumeData) return <Box />;

  // -------------------------------------------------------------------------
  // Cells
  // -------------------------------------------------------------------------
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
      content: (
        <VolumeRenderer
          volumeData={volumeData}
          volumeShape={volumeShape}
          threshold={threshold / 255}
        />
      ),
    },
    {
      key: "slice",
      title: "Slice View",
      content: (
        <SliceViewer
          volumeData={volumeData}
          volumeShape={volumeShape}
          slice={slice}
          plane={plane}
          threshold={threshold}
        />
      ),
    },
  ];

  // Drawer open: overview + 3 plots (4x1)
  // Drawer closed: 3 plots only (3x1)
  const cells = drawerOpen ? [overviewCell, ...plotCells] : plotCells;
  const cols = cells.length;

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  const layout = cells.map(({ key }, i) => ({
    i: key,
    x: i,
    y: 0,
    w: 1,
    h: h,
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
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
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

export default TomographyPlots;
