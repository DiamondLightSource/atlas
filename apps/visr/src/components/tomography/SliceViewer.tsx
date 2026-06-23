import { useEffect, useState } from "react";
import SliceRenderer from "./SliceRenderer";
import { Box, Typography } from "@mui/material";

export enum Plane {
  X,
  Y,
  Z,
}
interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

interface Props {
  // volumeData: Uint8Array;
  // volumeShape: [number, number, number];
  plane: Plane;
  depth: number; // maybe not the right name?
}
function TwoDimensional(arr: Uint8Array | number[], size: number) {
  const res = [];
  for (let i = 0; i < arr.length; i = i + size)
    res.push(arr.slice(i, i + size));
  return res;
}
export default function SliceViewer({ plane, depth }: Props) {
  // add props
  const [volume, setVolume] = useState<Volume | null>(null);

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

  if (volume == undefined) {
    return <Box />;
  }
  //////////////////////// dummy array /////////////////////////
  // const sliceraw = [
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  //   [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  //   [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  //   [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  //   [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  //   [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  //   [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  //   [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  //   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // ];
  //const slice = sliceraw.map(row => row.map(value => value * 255));
  /////////////////////////////////////////////////////////////

  let slice: Uint8Array<ArrayBuffer>;
  let slice2D: number[][] = new Array(new Array(volume.volumeShape[1]));
  if (plane == Plane.Z) {
    slice = volume?.volumeData.slice(
      volume.volumeShape[1] * volume.volumeShape[2] * depth,
      volume.volumeShape[1] * volume.volumeShape[2] * (depth + 1),
    );
    slice2D = [].slice.call(TwoDimensional(slice, volume.volumeShape[1]));
  }

  const array: number[][] = [];
  if (plane == Plane.X) {
    for (let i = 0; i < volume.volumeShape[0]; i++) {
      const line: number[] = [];
      for (let col = 0; col < volume.volumeShape[1]; col++) {
        const index =
          col +
          depth * volume.volumeShape[1] +
          i * volume.volumeShape[1] * volume.volumeShape[2];
        line.push(volume.volumeData[index]);
      }
      array.push(line);
    }
  }
  if (plane == Plane.Y) {
    for (let i = 0; i < volume.volumeShape[0]; i++) {
      const line: number[] = [];
      for (let row = 0; row < volume.volumeShape[2]; row++) {
        const index =
          depth +
          row * volume.volumeShape[2] +
          i * volume.volumeShape[1] * volume.volumeShape[2];
        line.push(volume.volumeData[index]);
      }
      array.push(line);
    }
  }

  // useEffect(() => {
  //   // maths to find the correct slice from the volume
  // }, []); // useffect should be retriggered by a change in choice of plane or depth (which will be changed form the controls)

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
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
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            transform: plane === Plane.Z ? "rotate(180deg)" : "rotate(270deg)",
          }}
        >
          <SliceRenderer
            slicearray={plane === Plane.Z ? [].slice.call(slice2D) : array}
          />
        </Box>
      </Box>
    </Box>
  );
}
