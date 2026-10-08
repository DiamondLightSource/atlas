import { Box, Typography } from "@mui/material";
import { useState } from "react";
import SliceViewer from "./SliceViewer";
import VolumeRenderer from "./VolumeRenderer";
import { Plane } from "./PlaneEnum";

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  volumeVisible: boolean;
  slice: number;
  plane: Plane;
}

function CamPva() {
  const [imgSrc, setImgSrc] = useState(
    "https://visr-pvws.diamond.ac.uk/mjpg/BL01C-DI-DCAM-05:PVA:OUTPUT",
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

function TomographyPlots({ volumeData, volumeShape, plane, slice }: Props) {
  if (!volumeData) return <Box />;

  const views = [
    <CamPva />,
    <VolumeRenderer volumeData={volumeData} volumeShape={volumeShape} />,
    <SliceViewer
      volumeData={volumeData}
      volumeShape={volumeShape}
      slice={slice}
      plane={plane}
    />,
  ];

  const titles = ["Camera View", "Reconstruction", "Slice View"];

  return (
    <Box
      sx={{
        // fill whatever height the parent gives us
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "minmax(0, 1fr)", // bounds the cells to our height
      }}
    >
      {views.map((view, i) => (
        <Box
          key={i}
          sx={{
            minWidth: 0,
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
            borderColor="divider"
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
      ))}
    </Box>
  );
}

export default TomographyPlots;
