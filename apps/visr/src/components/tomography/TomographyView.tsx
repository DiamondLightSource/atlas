import { Box, Divider, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import Controls from "./Controls";
import SliceViewer, { Plane } from "./SliceViewer";

const SCAN_DURATION_MS = 3000;

function TomographyView() {
  const [volumeVisible, setVolumeVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const [revolve, setRevolve] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slice, setSlice] = useState<number>(1);
  const [plane, setPlane] = useState<Plane>(Plane.Z);

  //use local storage to persist values across multiple open tabs
  useEffect(() => {
    localStorage.setItem("plane", plane.toString());
    localStorage.setItem("volumeVisible", volumeVisible.toString());
    localStorage.setItem("slice", slice.toString());
    console.log(localStorage.getItem("slice"));
    localStorage.setItem("progress", progress.toString());
  }, [plane, volumeVisible, slice, progress]);

  useEffect(() => {
    const onReceiveMessage = (e: { key: any; newValue: any }) => {
      const { key, newValue } = e;
      switch (key) {
        case "plane": {
          setPlane(newValue);
          break;
        }
        case "volumeVisible": {
          setVolumeVisible(newValue);
          break;
        }
        case "slice": {
          setSlice(Number(newValue));
          break;
        }
        case "progress": {
          setProgress(Number(newValue));
          break;
        }
      }
    };
    window.addEventListener("storage", onReceiveMessage);
    return () => {
      window.removeEventListener("storage", onReceiveMessage);
    };
  }, []);

  console.log("volumeVisible: " + volumeVisible);
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

  const handlePlane = (event: React.ChangeEvent<HTMLInputElement>) => {
    const radioValue = Number((event.target as HTMLInputElement).value);
    setPlane(radioValue);
  };

  // revolve to be implemented
  console.log("plane: " + plane);
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
      <Stack
        direction={menuOpen ? "column" : "row"}
        divider={<Divider orientation="vertical" />}
      >
        <Box
          sx={{
            width: "30%",
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CameraViewer />
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "30%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <VolumeViewer visible={volumeVisible} />
        </Box>
        <Box
          sx={{
            flex: 1,
            width: "30%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SliceViewer depth={slice} plane={plane} />
        </Box>
      </Stack>

      <Controls
        onRun={handleRun}
        onReset={handleReset}
        onSlide={handleSlider}
        onSetDirection={handlePlane}
        plane={plane}
        progress={progress}
        slice={slice}
      />
    </Box>
  );
}

export default TomographyView;
