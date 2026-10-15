import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import TomographyControls from "./TomographyControls";
import { TomographyForm } from "./TomographyForm";
import { Plane } from "./PlaneEnum";
import ControlsDrawer from "../ControlsDrawer";
import TomographyPlots from "./TomographyPlots";
import ReconstructionSelect from "./ReconstructionSelect";
import {
  fetchVolume,
  listReconstructions,
  type Reconstruction,
} from "./reconstruction";

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
  const [volumeVisible, setVolumeVisible] = useState(true);
  // const [revolve, setRevolve] = useState(false);
  const [slice, setSlice] = useState<number>(0);
  const [plane, setPlane] = useState<Plane>(Plane.Z);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const [reconstructions, setReconstructions] = useState<Reconstruction[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("Looking for reconstructions…");

  // -------------------------------------------------------------------------
  // Find the reconstructions in Tiled, and show the newest
  // -------------------------------------------------------------------------
  useEffect(() => {
    listReconstructions()
      .then(found => {
        setReconstructions(found);
        if (found.length === 0) setStatus("No reconstructions in Tiled yet");
        else setSelected(found[0].path);
      })
      .catch((e: Error) => setStatus(e.message));
  }, []);

  useEffect(() => {
    const reconstruction = reconstructions.find(r => r.path === selected);
    if (!reconstruction) return;
    let current = true;
    setStatus(`Loading ${reconstruction.label}…`);
    fetchVolume(reconstruction)
      .then(volumeData => {
        if (!current) return;
        setVolume({ volumeData, volumeShape: reconstruction.shape });
        // the old slice may be past the end of this volume
        setSlice(s => Math.min(s, Math.min(...reconstruction.shape) - 1));
      })
      .catch((e: Error) => current && setStatus(e.message));
    return () => {
      current = false;
    };
  }, [reconstructions, selected]);

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

  if (!volume) {
    return (
      <Typography sx={{ p: 3 }} color="text.secondary">
        {status}
      </Typography>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1, // fill whatever TabbedPanel gives us
        minHeight: 480, // below this, the TabbedPanel scroller takes over
        minWidth: 260 * 3,
      }}
    >
      <TomographyPlots
        volumeData={volume.volumeData}
        volumeVisible={volumeVisible}
        plane={plane}
        slice={slice}
        volumeShape={volume.volumeShape}
      />
      <ControlsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={[
          <TomographyForm />,
          <ReconstructionSelect
            reconstructions={reconstructions}
            selected={selected}
            onSelect={setSelected}
          />,
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
