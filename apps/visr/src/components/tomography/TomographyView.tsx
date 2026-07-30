import { Box, Divider, Stack } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import CameraViewer from "./CameraViewer";
import VolumeViewer from "./VolumeViewer";
import Controls from "./Controls";
import SliceViewer from "./SliceViewer";
import { Plane } from "./PlaneEnum";
import ControlsDrawer from "../ControlsDrawer";
import { ReactGridLayout, useContainerWidth } from "react-grid-layout";

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
  const [slice, setSlice] = useState<number>(0);
  const [plane, setPlane] = useState<Plane>(Plane.Z);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const DRAWER_COLLAPSED_HEIGHT = 64;
  const NAVBAR_HEIGHT = 32;
  // const PLOT_ASPECT_RATIO = 0.75;

  const { width, containerRef, mounted } = useContainerWidth();
  const h = 11;
  const w = 1;

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h },
    { i: "1", x: 1, y: 0, w: w, h: h },
    { i: "2", x: drawerOpen ? 2 : 2, y: 0, w: w, h: h },
  ];

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

  //use local storage to persist values across multiple open tabs
  useEffect(() => {
    localStorage.setItem("plane", plane.toString());
    localStorage.setItem("volumeVisible", volumeVisible.toString());
    localStorage.setItem("slice", slice.toString());
    localStorage.setItem("progress", progress.toString());
  }, [plane, volumeVisible, slice, progress]);

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

  if (!volume) return <Box />;

  const views = [
    <CameraViewer />,
    <VolumeViewer
      volumeData={volume.volumeData}
      volumeShape={volume.volumeShape}
      visible={volumeVisible}
    />,
    <SliceViewer
      volumeData={volume.volumeData}
      volumeShape={volume.volumeShape}
      slice={slice}
      plane={plane}
    />,
  ];
  const plots = views.map(({ key }, i) => (
    <div
      key={i}
      style={{
        flex: 1,
        // width: "30%",
        minWidth: 260,
        display: "flex",
        flexDirection: "column",
        background: "red",
      }}
    >
      {views[i]}
    </div>
  ));
  console.log(plots[0]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minWidth: 0,
        height: `calc(100vh - ${DRAWER_COLLAPSED_HEIGHT + NAVBAR_HEIGHT}px)`,
      }}
    >
      <div ref={containerRef! as React.RefObject<HTMLDivElement>} color="blue">
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{
              cols: drawerOpen ? 3 : 3,
              rowHeight: drawerOpen ? 25 : 50,
            }}
          >
            {plots}
          </ReactGridLayout>
        )}
      </div>
      <ControlsDrawer
        open={drawerOpen}
        collapsedHeight={DRAWER_COLLAPSED_HEIGHT}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={
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
        }
      />
    </Box>
  );
}

export default TomographyView;
