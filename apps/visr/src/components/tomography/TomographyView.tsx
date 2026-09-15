import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TomographyControls from "./TomographyControls";
import { TomographyForm } from "./TomographyForm";
import { Plane } from "./PlaneEnum";
import ControlsDrawer from "../ControlsDrawer";
import TomographyPlots from "./TomographyPlots";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const DRAWER_COLLAPSED_HEIGHT = 80;
const NAVBAR_HEIGHT = 32;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TomographyView() {
  const [volume, setVolume] = useState<Volume | null>(null);
  const [volumeVisible, setVolumeVisible] = useState(true);
  // const [revolve, setRevolve] = useState(false);
  const [slice, setSlice] = useState<number>(0);
  const [plane, setPlane] = useState<Plane>(Plane.Z);
  const [drawerOpen, setDrawerOpen] = useState(true);

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
  // Persist values across multiple open tabs
  // -------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("plane", plane.toString());
    localStorage.setItem("volumeVisible", volumeVisible.toString());
    localStorage.setItem("slice", slice.toString());
  }, [plane, volumeVisible, slice]);

  useEffect(() => {
    const onReceiveMessage = (e: StorageEvent) => {
      const { key, newValue } = e;
      switch (key) {
        case "plane": {
          setPlane(Number(newValue));
          break;
        }
        case "volumeVisible": {
          setVolumeVisible(Boolean(newValue));
          break;
        }
        case "slice": {
          setSlice(Number(newValue));
          break;
        }
      }
    };
    window.addEventListener("storage", onReceiveMessage);
    return () => {
      window.removeEventListener("storage", onReceiveMessage);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSlider = (event: Event, newValue: number | number[]) => {
    const slice = typeof newValue == "number" ? newValue : newValue[0];
    setSlice(slice);
  };

  const handlePlane = (event: React.ChangeEvent<HTMLInputElement>) => {
    const radioValue = Number((event.target as HTMLInputElement).value);
    setPlane(radioValue);
  };

  // revolve to be implemented

  if (!volume) return <Box />;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minWidth: 260 * 3,
        height: `calc(100vh - ${DRAWER_COLLAPSED_HEIGHT + NAVBAR_HEIGHT}px)`,
      }}
    >
      <TomographyPlots
        volumeData={volume.volumeData}
        volumeVisible={volumeVisible}
        plane={plane}
        slice={slice}
        volumeShape={volume.volumeShape}
        drawerOpen={drawerOpen}
      />
      <ControlsDrawer
        open={drawerOpen}
        collapsedHeight={DRAWER_COLLAPSED_HEIGHT}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={[
          <TomographyForm />,
          <TomographyControls
            onSlide={handleSlider}
            onSetDirection={handlePlane}
            plane={plane}
            slice={slice}
            volumeShape={volume.volumeShape}
          />,
        ]}
      />
    </Box>
  );
}

export default TomographyView;
