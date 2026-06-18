import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import VolumeRenderer from "./VolumeRenderer";

interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

interface Props {
  visible: boolean;
  // revolve?: boolean
}

// Currently loads a static test volume from public/test-data/
export default function VolumeViewer({ visible }: Props) {
  const [volume, setVolume] = useState<Volume | null>(null);

  useEffect(() => {
    async function loadTestVolume() {
      const [metaRes, rawRes] = await Promise.all([
        fetch("/test-data/volume.json"),
        fetch("/test-data/volume.raw"),
      ]);
      const meta = (await metaRes.json()) as {
        shape: [number, number, number];
      };
      const buffer = await rawRes.arrayBuffer();
      setVolume({
        volumeData: new Uint8Array(buffer),
        volumeShape: meta.shape,
      });
    }

    loadTestVolume();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="primary">
          Reconstruction
        </Typography>
      </Box>

      {visible && volume ? (
        <Box sx={{ flex: 1 }}>
          <VolumeRenderer
            volumeData={volume.volumeData}
            volumeShape={volume.volumeShape}
            // revolve={revolve}
          />
        </Box>
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
