import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TomographyControls from "./TomographyControls";
import { TomographyForm } from "./TomographyForm";
import { Plane, maxSliceFor } from "./plane";
import ControlsPane from "../ControlsPane";
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
  // one choice for every experiment page, kept across reloads and tabs
  const [paneOpen, setPaneOpen] = useSharedState("controls:open", true);

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

  // Another tab may switch to an axis with fewer slices, so clamp locally.
  // The layout shows before the volume loads, as spectroscopy's does
  const clampedSlice = volume
    ? Math.min(slice, maxSliceFor(volume.volumeShape, plane))
    : slice;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  // The plots take the width the controls pane leaves
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        // as tall as the page area and no taller, so only the plots scroll
        minHeight: 0,
        minWidth: 400,
        height: "100%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          // stacked plots scroll, with the scrollbar hidden; never sideways
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <TomographyPlots
          volumeData={volume?.volumeData}
          volumeVisible={true}
          plane={plane}
          slice={clampedSlice}
          threshold={threshold}
          volumeShape={volume?.volumeShape}
          paneOpen={paneOpen}
        />
      </Box>
      <ControlsPane
        open={paneOpen}
        onToggle={() => setPaneOpen(prev => !prev)}
        tabs={[
          { label: "Scan", content: <TomographyForm /> },
          {
            label: "Display",
            content: (
              <TomographyControls
                onSlide={handleSlider}
                onSetDirection={handlePlane}
                onThreshold={handleThreshold}
                plane={plane}
                slice={clampedSlice}
                threshold={threshold}
                volumeShape={volume?.volumeShape}
              />
            ),
          },
        ]}
      />
    </Box>
  );
}

export default TomographyView;
