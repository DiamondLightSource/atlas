import { Box, Divider, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import Controls from "./Controls";
import SliceViewer from "./SliceViewer";
import { Plane } from "./PlaneEnum";

interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

const SCAN_DURATION_MS = 3000;

function TomographyView() {
  const [volume, setVolume] = useState<Volume | null>(null);
  const [volumeVisible, setVolumeVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const [revolve, setRevolve] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slice, setSlice] = useState<number>(0);
  const [plane, setPlane] = useState<Plane>(Plane.Z);

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
      //test data - to be removed
      const testData: Volume = {
        volumeData: new Uint8Array([
          0, 1, 2, 3, 224, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
          36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
          53, 54, 55, 56, 57, 58, 59, 60,
        ]),
        volumeShape: [3, 4, 5],
      };

      // setVolume(testData); //uncomment to use simple test data
      console.log("test data", testData);
    }

    loadTestVolume();
  }, []);

  //use local storage to persist values across multiple open tabs
  useEffect(() => {
    localStorage.setItem("plane", plane.toString());
    localStorage.setItem("volumeVisible", volumeVisible.toString());
    localStorage.setItem("slice", slice.toString());
    localStorage.setItem("progress", progress.toString());
  }, [plane, volumeVisible, slice, progress]);

  useEffect(() => {
    const onReceiveMessage = (e: { key: any; newValue: any }) => {
      const { key, newValue } = e;
      switch (key) {
        case "plane": {
          setPlane(Number(newValue));
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
          {volume ? (
            <VolumeViewer
              volumeData={volume.volumeData}
              volumeShape={volume.volumeShape}
              visible={volumeVisible}
            />
          ) : (
            <Box />
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            width: "30%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {volume ? (
            <SliceViewer
              volumeData={volume.volumeData}
              volumeShape={volume.volumeShape}
              slice={slice}
              plane={plane}
            />
          ) : (
            <Box />
          )}
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
        volumeShape={volume ? volume.volumeShape : [0, 0, 0]}
      />
    </Box>
  );
}

export default TomographyView;
