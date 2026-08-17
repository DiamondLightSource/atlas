import { Box, Typography } from "@mui/material";
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
    { i: "0", x: 0, y: 0, w: w, h: h, static: true },
    { i: "1", x: 1, y: 0, w: w, h: h, static: true },
    { i: "2", x: drawerOpen ? 2 : 2, y: 0, w: w, h: h, static: true },
  ];

  if (!volumeData) return <Box />;

  const views = [
    <img
      src="https://visr-pvws.diamond.ac.uk/mjpg/BL01B-DI-CAM-01:PVA:OUTPUT"
      alt="Detector"
    />,
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
  const titles = ["Camera View", "Reconstruction", "Slice View"];
  const plots = views.map((view, i) => (
    <Box
      key={i}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        minWidth: 260,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="primary">
          {titles[i]}
        </Typography>
      </Box>
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
            margin: [20, 20], //twice the margin of Spectroscopy plots as half the number of rows
          }}
        >
          {plots}
        </ReactGridLayout>
      )}
    </Box>
  );
}

export default TomographyPlots;
