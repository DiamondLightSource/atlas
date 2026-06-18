import { Box, circularProgressClasses, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import VolumeRenderer from "./VolumeRenderer";
import { Box3 } from "three";
import { data } from "react-router-dom";

interface Volume {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
}

interface Props {
  volume: Volume;
  axis: 0 | 1 | 2; //x, y, z
  slice: number; //which slice to display
}

function getZSlice(
  array: Uint8Array,
  width: number,
  height: number,
  zIndex: number,
): Uint8Array {
  const sliceSize: number = width * height;
  const start: number = zIndex * sliceSize;
  const end: number = start + sliceSize;

  if (end > array.length) {
    throw new RangeError(
      "Slice index out of bounds for the given array dimensions.",
    );
  }

  return array.subarray(start, end);
}

// Currently loads a static test volume from public/test-data/
export default function SliceRenderer({ volume, axis, slice }: Props) {
  // axis = 2;
  // const length = volume.volumeData.length;
  // console.log(length);
  // const lengthOneSlice = length / 128;
  // console.log(lengthOneSlice);
  // //get first slice for now
  // const dataSlice = volume.volumeData.slice(100000, 101000); //lengthOneSlice - 1);
  // const matrix: number[][] = [];
  // const not10 = [];
  // for (let i = 0, k = -1; i < dataSlice.length; i++) {
  //   if (i % 10 === 0) {
  //     k++;
  //     matrix[k] = [];
  //   }
  //   matrix[k].push(dataSlice[i]);
  //   if (dataSlice[i] != 10) {
  //     not10.push(dataSlice[i]);
  //   }
  // }
  // console.log(matrix);
  // console.log("no10: " + not10);
  // let base64ImageString = Buffer.from(matrix, "binary").toString("base64");
  //let srcValue = "data:image/png;base64," + dataSlice;

  // Example usage:
  const width = volume.volumeShape[0];
  const height = volume.volumeShape[1];
  const depth = volume.volumeShape[2];
  const array3D = volume.volumeData;
  const slice2D: Uint8Array = getZSlice(array3D, width, height, 10);
  const content = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 5, 0,
    0, 0, 5, 8, 6, 0, 0, 0, 141, 111, 38, 229, 0, 0, 0, 28, 73, 68, 65, 84, 8,
    215, 99, 248, 255, 255, 63, 195, 127, 6, 32, 5, 195, 32, 18, 132, 208, 49,
    241, 130, 88, 205, 4, 0, 14, 245, 53, 203, 209, 142, 14, 31, 0, 0, 0, 0, 73,
    69, 78, 68, 174, 66, 96, 130,
  ]);
  const url = URL.createObjectURL(
    new Blob([slice2D.buffer as ArrayBuffer], { type: "img/png" }),
  );
  return (
    <Box
      component="img"
      src={url}
      alt="projection"
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        imageRendering: "pixelated",
      }}
    />
  );
}

// type Axis = 'XY' | 'XZ' | 'YZ';

// /**
//  * Extracts a 2D slice along any given plane orientation.
//  *
//  * @param array The flat 3D Uint8Array source
//  * @param w Grid Width (X)
//  * @param h Grid Height (Y)
//  * @param d Grid Depth (Z)
//  * @param plane The orientation plane ('XY', 'XZ', or 'YZ')
//  * @param index The fixed axis index (Z for XY, Y for XZ, X for YZ)
//  */
// function extractPlane(
//   array: Uint8Array,
//   w: number,
//   h: number,
//   d: number,
//   plane: Axis,
//   index: number
// ): Uint8Array {
//   const sliceSize = w * h;

//   if (plane === 'XY') {
//     // Fast path: contiguous memory block
//     return array.subarray(index * sliceSize, (index + 1) * sliceSize);
//   }

//   if (plane === 'XZ') {
//     // Fixed Y index: loop through X and Z
//     const result = new Uint8Array(w * d);
//     for (let z = 0; z < d; z++) {
//       for (let x = 0; x < w; x++) {
//         const srcIdx = x + (index * w) + (z * sliceSize);
//         const destIdx = x + (z * w);
//         result[destIdx] = array[srcIdx];
//       }
//     }
//     return result;
//   }

//   if (plane === 'YZ') {
//     // Fixed X index: loop through Y and Z
//     const result = new Uint8Array(h * d);
//     for (let z = 0; z < d; z++) {
//       for (let y = 0; y < h; y++) {
//         const srcIdx = index + (y * w) + (z * sliceSize);
//         const destIdx = y + (z * h);
//         result[destIdx] = array[srcIdx];
//       }
//     }
//     return result;
//   }

//   throw new Error("Invalid plane specified.");
// }
