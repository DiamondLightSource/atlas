import { Box, Typography } from "@mui/material";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useState } from "react";
import SliceViewer from "./SliceViewer";
import VolumeRenderer from "./VolumeRenderer";
import { Plane } from "./PlaneEnum";

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
  // revolve?: boolean
}

// ---------------------------------------------------------------------------
// Camera view
// ---------------------------------------------------------------------------

function CamPva() {
  const [imgSrc, setImgSrc] = useState(
    "https://visr-pvws.diamond.ac.uk/mjpg/BL01B-DI-CAM-01:PVA:OUTPUT",
  );

  return (
    <Box
      component="img"
      src={imgSrc}
      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
      onError={() => setImgSrc("../../../test-data/seal.png")}
      alt="Camera view"
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TomographyPlots({
  volumeData,
  volumeShape,
  plane,
  slice,
  drawerOpen,
}: Props) {
  const { width, containerRef, mounted } = useContainerWidth();

  // -------------------------------------------------------------------------
  // Grid sizing
  // -------------------------------------------------------------------------
  const h = 10;
  const w = 1;
  const minimumRowHeight = 40;
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

  // -------------------------------------------------------------------------
  // Layout: 3x1
  // -------------------------------------------------------------------------
  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h, static: true },
    { i: "1", x: 1, y: 0, w: w, h: h, static: true },
    { i: "2", x: 2, y: 0, w: w, h: h, static: true },
  ];

  if (!volumeData) return <Box />;

  // -------------------------------------------------------------------------
  // Views
  // -------------------------------------------------------------------------
  const views = [
    <CamPva />,
    <VolumeRenderer
      volumeData={volumeData}
      volumeShape={volumeShape}
      // revolve={revolve}
    />,
    <SliceViewer
      volumeData={volumeData}
      volumeShape={volumeShape}
      slice={slice}
      plane={plane}
    />,
  ];

  const titles = ["Camera View", "Reconstruction", "Slice View"];

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
            cols: 3,
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
