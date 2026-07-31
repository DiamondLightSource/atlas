import { Box, Typography } from "@mui/material";
import VolumeRenderer from "./VolumeRenderer";

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  visible: boolean;
  // revolve?: boolean
}

// Currently loads a static test volume from public/test-data/
export default function VolumeViewer({
  volumeData,
  volumeShape,
  visible,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundClipcolor: "background.paper",
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
          Reconstruction
        </Typography>
      </Box>

      {visible && volumeData && volumeShape ? (
        <VolumeRenderer
          volumeData={volumeData}
          volumeShape={volumeShape}
          // revolve={revolve}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">...</Typography>
        </Box>
      )}
    </Box>
  );
}
