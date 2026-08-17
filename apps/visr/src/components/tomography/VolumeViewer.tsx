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
  return visible && volumeData && volumeShape ? (
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
  );
}
