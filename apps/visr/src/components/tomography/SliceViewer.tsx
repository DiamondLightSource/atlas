import { useEffect, useState } from "react";
import SliceRenderer from "./SliceRenderer";
import { Box, Typography } from "@mui/material";
import type { mx_bits_to_01 } from "three/examples/jsm/nodes/materialx/lib/mx_noise.js";
import ndarray from "ndarray";

enum Plane {
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
  plane: string; //Plane;
  depth: number; // maybe not the right name?
}
function TwoDimensional(arr: Uint8Array | number[], size: number) {
  var res = [];
  for (var i = 0; i < arr.length; i = i + size)
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

  console.log(volume?.volumeData);
  if (volume == undefined) {
    return <Box />;
  }
  //////////////////////// dummy array /////////////////////////
  const sliceraw = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  //const slice = sliceraw.map(row => row.map(value => value * 255));
  /////////////////////////////////////////////////////////////
  console.log("depth: " + depth);
  console.log("plane: " + plane);

  var slice: Uint8Array<ArrayBuffer>;
  var slice2D: number[][] = new Array(new Array(91));
  if (plane == "Z") {
    slice = volume?.volumeData.slice(
      volume.volumeShape[1] * volume.volumeShape[2] * depth,
      volume.volumeShape[1] * volume.volumeShape[2] * (depth + 1),
    );
    slice2D = [].slice.call(TwoDimensional(slice, 91));
  }

  var array: number[][] = [];
  if (plane == "X") {
    for (var i = 0; i < 128; i++) {
      var line: number[] = [];
      for (var col = 0; col < 91; col++) {
        var index = col + depth * 91 + i * 91 * 91;
        line.push(volume.volumeData[index]);
      }
      array.push(line);
    }
  }
  if (plane == "Y") {
    for (var i = 0; i < 128; i++) {
      var line: number[] = [];
      for (var row = 0; row < 91; row++) {
        var index = depth + row * 91 + i * 91 * 91;
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
            transform: plane === "Z" ? "rotate(180deg)" : "rotate(270deg)",
          }}
        >
          <SliceRenderer
            slicearray={plane === "Z" ? [].slice.call(slice2D) : array}
          />
          {/* <SliceRenderer slicearray={array} />/ */}
          {/* <SliceRenderer slicearray={[].slice.call(nd2d2d2D)} /> */}
        </Box>
      </Box>
    </Box>
  );
}
