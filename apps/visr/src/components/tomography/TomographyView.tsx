import { Box, Divider, Slider, Stack } from "@mui/material";
import { useRef, useState } from "react";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import Controls from "./Controls";
import SliceViewer from "./SliceViewer";

const SCAN_DURATION_MS = 3000;

function TomographyView() {
  const [volumeVisible, setVolumeVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const [revolve, setRevolve] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slice, setSlice] = useState<number>(1);
  // run waits 3 seconds, updating progress bar then allows mock volume to be seen
  const handleRun = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVolumeVisible(false);
    setProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const next = Math.min((elapsed / SCAN_DURATION_MS) * 100, 100);
      setProgress(next);
      if (next >= 100) {
        clearInterval(intervalRef.current!);
        setVolumeVisible(true);
      }
    }, 50);
  };

  // reset reverts progress bar and volume viewing
  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVolumeVisible(false);
    setProgress(0);
  };

  const handleSlider = (event: Event, newValue: number | number[]) => {
    const slice = typeof newValue == "number" ? newValue : newValue[0];
    setSlice(slice);
  };
  // revolve to be implemented

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "92dvh",
        color: "text.primary",
        bgcolor: "background.default",
      }}
    >
      <Stack divider={<Divider orientation="horizontal" />}>
        {/* Upper panel */}
        <Box
          sx={{
            width: "40%",
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CameraViewer />
        </Box>

        {/* Lower panel */}
        <Stack
          direction={menuOpen ? "column" : "row"}
          divider={<Divider orientation="vertical" />}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <VolumeViewer visible={volumeVisible} />
          </Box>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SliceViewer depth={slice} />
          </Box>
        </Stack>
      </Stack>

      <Controls
        onRun={handleRun}
        onReset={handleReset}
        onSlide={handleSlider}
        progress={progress}
      />
    </Box>
  );
}

export default TomographyView;
