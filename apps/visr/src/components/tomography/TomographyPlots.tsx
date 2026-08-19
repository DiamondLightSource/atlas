import { Box } from "@mui/material";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import SliceViewer from "./SliceViewer";
import { Plane } from "./PlaneEnum";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutEffect, useState } from "react";

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
  volumeVisible,
  plane,
  slice,
  drawerOpen,
}: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const h = 10;
  const w = 1;
  const verticalMargin = 20;
  const minimumRowHeight = 10;
  const minimumGridHeight = minimumRowHeight * h + verticalMargin * (h - 1);
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
      ? Math.max(
          (containerHeight - verticalMargin * (h - 1)) / h,
          minimumRowHeight,
        )
      : drawerOpen
        ? minimumRowHeight
        : 50;
  const gridHeight = rowHeight * h + verticalMargin * (h - 1);

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h, static: true },
    { i: "1", x: 1, y: 0, w: w, h: h, static: true },
    { i: "2", x: drawerOpen ? 2 : 2, y: 0, w: w, h: h, static: true },
  ];

  if (!volumeData) return <Box />;

  const views = [
    <CameraViewer />,
    <VolumeViewer
      volumeData={volumeData}
      volumeShape={volumeShape}
      visible={volumeVisible}
    />,
    <SliceViewer
      volumeData={volumeData}
      volumeShape={volumeShape}
      slice={slice}
      plane={plane}
    />,
  ];
  const plots = views.map((view, i) => (
    <Box
      key={i}
      sx={{
        // flex: 1,
        // minWidth: 260,
        maxHeight: gridHeight,
      }}
    >
      {view}
    </Box>
  ));

  return (
    <Box
      ref={containerRef! as React.RefObject<HTMLDivElement>}
      sx={{
        flex: "1 1 0",
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
            cols: drawerOpen ? 3 : 3,
            rowHeight: rowHeight,
            margin: [verticalMargin, verticalMargin],
          }}
        >
          {plots}
        </ReactGridLayout>
      )}
    </Box>
  );
}

export default TomographyPlots;
