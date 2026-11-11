import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TomographyControls from "./TomographyControls";
import { TomographyForm } from "./TomographyForm";
import { Plane } from "./plane";
import ControlsDrawer from "../ControlsDrawer";
import TomographyPlots from "./TomographyPlots";
import { useSharedState } from "../../hooks/useSharedState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TomographyView() {
  const [volume, setVolume] = useState<Volume | null>(null);
  // const [revolve, setRevolve] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Shared across all open tabs (and restored on reload)
  const [slice, setSlice] = useSharedState("tomography:slice", 0);
  const [plane, setPlane] = useSharedState<Plane>("tomography:plane", Plane.Z);
  const [threshold, setThreshold] = useSharedState("tomography:threshold", 38); // 38/255 ≈ 0.15, the renderer's old default

  // -------------------------------------------------------------------------
  // Load test volume
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSlider = (_event: Event, newValue: number | number[]) => {
    setSlice(typeof newValue === "number" ? newValue : newValue[0]);
  };

  const handlePlane = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlane(Number(event.target.value) as Plane);
  };

  const handleThreshold = (_event: Event, newValue: number | number[]) => {
    setThreshold(typeof newValue === "number" ? newValue : newValue[0]);
  };

  // revolve to be implemented

  if (!volume) return <Box />;

  // Another tab may switch to an axis with fewer slices, so clamp locally
  const maxSlice: Record<Plane, number> = {
    [Plane.Z]: volume.volumeShape[0] - 1,
    [Plane.Y]: volume.volumeShape[1] - 1,
    [Plane.X]: volume.volumeShape[2] - 1,
  };
  const clampedSlice = Math.min(slice, maxSlice[plane]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 260 * 3,
        height: "100%",
      }}
    >
      <TomographyPlots
        volumeData={volume.volumeData}
        volumeVisible={true}
        plane={plane}
        slice={clampedSlice}
        threshold={threshold}
        volumeShape={volume.volumeShape}
        drawerOpen={drawerOpen}
      />
      <ControlsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={[
          <TomographyForm key="form" />,
          <TomographyControls
            key="controls"
            onSlide={handleSlider}
            onSetDirection={handlePlane}
            onThreshold={handleThreshold}
            plane={plane}
            slice={clampedSlice}
            threshold={threshold}
            volumeShape={volume.volumeShape}
          />,
        ]}
      />
    </Box>
  );
}

export default TomographyView;
