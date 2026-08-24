import { Box, Typography } from "@mui/material";
import SliceViewer from "./SliceViewer";
import { Plane } from "./PlaneEnum";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useState } from "react";
import VolumeRenderer from "./VolumeRenderer";

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  drawerOpen: boolean;
  volumeVisible: boolean;
  slice: number;
  plane: Plane;
  // revolve?: boolean
}
function TomographyPlots({
  volumeData,
  volumeShape,
  plane,
  slice,
  drawerOpen,
}: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const h = 10;
  const w = 1;
  const minimumRowHeight = 20;
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

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h, static: true },
    { i: "1", x: 1, y: 0, w: w, h: h, static: true },
    { i: "2", x: drawerOpen ? 2 : 2, y: 0, w: w, h: h, static: true },
  ];

  const resizeKey = `${drawerOpen}`; // `${width}`; //`${drawerOpen}-${width}`;

  if (!volumeData) return <Box />;

  const views = [
    <img
      src="https://visr-pvws.diamond.ac.uk/mjpg/BL01B-DI-CAM-01:PVA:OUTPUT"
      alt="Detector"
    />,
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
      resizeKey={resizeKey}
    />,
  ];

  const titles = ["Camera View", "Reconstruction", "Slice View"];

  const plots = views.map((view, i) => (
    <Box
      key={i}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: 1,
        borderColor: "divider",
        // minWidth: 260,
        maxHeight: gridHeight,
      }}
    >
      <Typography
        variant="overline"
        color="primary"
        borderBottom={1}
        borderColor={"divider"}
        marginLeft={2}
      >
        {titles[i]}
      </Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {view}
      </Box>
    </Box>
  ));

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
          //key={`${width}`} //re-render the grid on width change so that plots resize correctly
          layout={layout}
          width={width}
          style={{ height: gridHeight }}
          gridConfig={{
            cols: drawerOpen ? 3 : 3,
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
