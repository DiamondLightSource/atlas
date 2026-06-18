import { Box, Typography, Slider } from "@mui/material";
import { useEffect, useState } from "react";
import type { Volume } from "./VolumeViewer";
import SliceRenderer from "./SliceRenderer";

export default function SliceViewer() {
  // view different image slices with slider

  const [images, setImages] = useState([
    "/test-data/seal.png",
    "/test-data/littleFoot.jpg",
    "/test-data/seal.png",
    "/test-data/littleFoot.jpg",
  ]);
  const [value, setValue] = useState<number>(0);
  const [volume, setVolume] = useState<Volume | null>(null);
  //getting data into usable format - same as in VolumeViewer
  useEffect(() => {
    async function loadTestVolume() {
      const [metaRes, rawRes] = await Promise.all([
        fetch("/test-data/volume.json"),
        fetch("/test-data/volume.raw"),
      ]);
      console.log("metaRes" + metaRes);
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
    console.log(volume);
  }, []);

  const handleChange = (event: Event, newValue: number | number[]) => {
    const newIndex = Array.isArray(newValue) ? newValue[0] : newValue;
    setValue(newIndex);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="primary">
          Slice View
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "hidden",
          p: 0.5,
        }}
      >
        {/* <Box
          component="img"
          src={images[value]}
          alt="image"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        /> */}
        {volume ? <SliceRenderer volume={volume} axis={0} slice={0} /> : ""}
      </Box>
      <Slider
        value={value}
        onChange={handleChange}
        // getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        shiftStep={1}
        defaultValue={0}
        marks
        step={1}
        min={0}
        max={images.length - 1}
        aria-label="Slice View"
      />
    </Box>
  );
}
