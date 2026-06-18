import { Box, Typography } from "@mui/material";
import SliceViewer from "./SliceViewer";

export default function CameraViewer() {
  // static image showing camera view/projection feed
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
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
          Camera View
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "hidden",
          p: 0.5,
        }}
      >
        {/* <Box
          component="img"
          src="/test-data/seal.png"
          alt="projection"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        /> */}

        <SliceViewer />
      </Box>
    </Box>
  );
}
