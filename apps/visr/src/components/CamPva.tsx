import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

interface CamPvaProps {
  src: string;
  alt?: string;
}

function CamPva({ src, alt = "Camera view" }: CamPvaProps) {
  const [connected, setConnected] = useState(false);

  // Start disconnected again if a different stream is passed in
  useEffect(() => {
    setConnected(false);
  }, [src]);

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      {!connected && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VideocamOffIcon sx={{ fontSize: 64, color: "grey.500" }} />
        </Box>
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setConnected(true)}
        onError={() => setConnected(false)}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          visibility: connected ? "visible" : "hidden",
        }}
      />
    </Box>
  );
}

export default CamPva;
