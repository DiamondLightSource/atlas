import { Box } from "@mui/material";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import SliceViewer from "./SliceViewer";
import { Plane } from "./PlaneEnum";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";

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

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h },
    { i: "1", x: 1, y: 0, w: w, h: h },
    { i: "2", x: drawerOpen ? 2 : 2, y: 0, w: w, h: h },
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
        flex: 1,
        minWidth: 260,
      }}
    >
      {view}
    </Box>
  ));
  console.log(plots[0]);
  return (
    <Box ref={containerRef! as React.RefObject<HTMLDivElement>} color="blue">
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{
            cols: drawerOpen ? 3 : 3,
            rowHeight: drawerOpen ? 25 : 50,
          }}
        >
          {plots}
        </ReactGridLayout>
      )}
    </Box>
  );
}

export default TomographyPlots;
