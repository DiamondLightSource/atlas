import SliceRenderer from "./SliceRenderer";
import { Box, Typography } from "@mui/material";
import { Plane } from "./PlaneEnum";

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  plane: Plane;
  slice: number; // maybe not the right name?
}
// function TwoDimensional(arr: Uint8Array | number[], size: number) {
//   const res = [];
//   for (let i = 0; i < arr.length; i = i + size)
//     res.push(arr.slice(i, i + size));
//   return res;
// }
export default function SliceViewer({
  volumeData,
  volumeShape,
  plane,
  slice,
}: Props) {
  if (volumeData == undefined || volumeShape == undefined) {
    return <Box />;
  }
  // let sliceData: Uint8Array<ArrayBuffer>;
  // let slice2D: number[][] = new Array(new Array(volumeShape[1]));
  const array: number[][] = [];
  switch (plane) {
    case Plane.Z: {
      // slice = volume?.volumeData.slice(
      //   volumeShape[1] * volumeShape[2] * slice,
      //   volumeShape[1] * volumeShape[2] * (slice + 1),
      // );
      // slice2D = [].slice.call(TwoDimensional(slice, volumeShape[1]));
      for (let row = 0; row < volumeShape[1]; row++) {
        const line: number[] = [];
        for (let col = 0; col < volumeShape[2]; col++) {
          const index =
            col +
            row * volumeShape[1] +
            slice * volumeShape[1] * volumeShape[2];
          line.push(volumeData[index]);
        }
        array.push(line);
      }
      break;
    }
    case Plane.X: {
      for (let depth = 0; depth < volumeShape[0]; depth++) {
        const line: number[] = [];
        for (let col = 0; col < volumeShape[2]; col++) {
          //maybe col < volumeShape[1]
          const index =
            col +
            slice * volumeShape[1] +
            depth * volumeShape[1] * volumeShape[2];
          line.push(volumeData[index]);
        }
        array.push(line);
      }
      break;
    }
    case Plane.Y: {
      for (let depth = 0; depth < volumeShape[0]; depth++) {
        const line: number[] = [];
        for (let row = 0; row < volumeShape[1]; row++) {
          //maybe row < volumeShape[2]
          const index =
            slice +
            row * volumeShape[2] +
            depth * volumeShape[1] * volumeShape[2];
          line.push(volumeData[index]);
        }
        array.push(line);
      }
      break;
    }
  }
  // useEffect(() => {
  //   // maths to find the correct slice from the volume
  // }, []); // useffect should be retriggered by a change in choice of plane or slice (which will be changed form the controls)

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
            slicearray={array} //plane === Plane.Z ? [].slice.call(slice2D) : array}
          />
        </Box>
      </Box>
    </Box>
  );
}
