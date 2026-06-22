import { useEffect, useState } from "react";
import SliceRenderer from "./SliceRenderer";
import { Box } from "@mui/material";
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
function TwoDimensional(arr: Uint8Array | number[] | undefined, size: number) {
  if (typeof arr == "undefined") {
    return [];
  }
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

  let slice: Uint8Array<ArrayBuffer> | undefined;
  if (plane == "Z") {
    slice = volume?.volumeData.slice(
      volume.volumeShape[1] * volume.volumeShape[2] * depth,
      volume.volumeShape[1] * volume.volumeShape[2] * (depth + 1),
    );
  }
  console.log("first slice: " + slice);
  // let sliceArray: number[] = [];
  // if (plane == "X") {
  // var array: number[] = [];
  var array: number[][] = [];
  let count = 0;
  for (var i = 0; i < 128; i++) {
    var arrayInside: number[] = [];
    //(var i = depth; i < depth + 91 * 91 * 128; i = i + 91) { //(var row = 0; row < 128; row + 91) {
    for (var col = 0; col < 91; col++) {
      var index = col + depth * 91 + i * 91 * 91;
      // var arr = volume.volumeData.slice(i, i + 91);
      arrayInside.push(volume.volumeData[index]);
      count++;
    }
    array.push(arrayInside);
  }

  const slice2D: number[][] = [].slice.call(TwoDimensional(slice, 91));

  // useEffect(() => {
  //   // maths to find the correct slice from the volume
  // }, []); // useffect should be retriggered by a change in choice of plane or depth (which will be changed form the controls)

  // const nddata = ndarray(volume.volumeData, [128, 91, 91]);
  // console.log("ndarray: " + nddata);
  // const nd2d = nddata.pick(1, null, null);
  // const nd2d1 = nddata.pick(null, null, 0);
  // const nd2d2 = nddata.pick(null, 0, null);
  // console.log(nd2d);
  // console.log(nd2d1);
  // console.log(nd2d2);
  // // let nd2d2d = TwoDimensional(nd2d.data.slice(depth, depth + 91), 91);
  // let nd2d2d = nd2d1.data.slice(
  //   volume.volumeShape[1] * volume.volumeShape[2] * depth,
  //   volume.volumeShape[1] * volume.volumeShape[2] * (depth + 1),
  // );
  // const nd2d2d2D: number[][] = [].slice.call(TwoDimensional(nd2d2d, 91));
  // // const nd2d2d =
  // console.log("nd2d2d: " + nd2d2d.length);
  return (
    <Box>
      <SliceRenderer
        slicearray={plane === "Z" ? [].slice.call(slice2D) : array}
      />
      {/* <SliceRenderer slicearray={array} />/ */}
      {/* <SliceRenderer slicearray={[].slice.call(nd2d2d2D)} /> */}
    </Box>
  );
}
