import SliceRenderer from "./SliceRenderer";
import { Box, Typography } from "@mui/material";
import { Plane } from "./PlaneEnum";
import { HeatmapPlot } from "@diamondlightsource/davidia";
import ndarray, { type NdArray } from "ndarray";
import { assign } from "ndarray-ops";
// import { createArrayFromView } from "@h5web/lib/";

function createArrayFromView<T extends Uint8Array>(
  view: NdArray<T>,
): NdArray<T> {
  const { data, size, shape } = view;

  const array = ndarray(
    (Array.isArray(data)
      ? []
      : new (data.constructor as Uint8ArrayConstructor)(size)) as T,
    shape,
  );

  assign(array, view);
  return array;
}
interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  plane: Plane;
  slice: number; // maybe not the right name?
}
export default function SliceViewer({
  volumeData,
  volumeShape,
  plane,
  slice,
}: Props) {
  if (volumeData == undefined || volumeShape == undefined) {
    return <Box />;
  }

  const volume = ndarray(volumeData, volumeShape);
  let sliceNdarray: ndarray.NdArray<Uint8Array>;

  switch (plane) {
    case Plane.Z: {
      sliceNdarray = createArrayFromView(volume.pick(slice, null, null));
      console.log("sliceNdArray", sliceNdarray);
      break;
    }
    case Plane.Y: {
      sliceNdarray = createArrayFromView(volume.pick(null, slice, null));
      console.log(sliceNdarray);
      break;
    }
    case Plane.X: {
      sliceNdarray = createArrayFromView(volume.pick(null, null, slice));
      console.log(sliceNdarray);
      break;
    }
  }

  //temporary code to convert ndarray to number[][] whilst Davidia not working with ndarray.pick
  // // Extract dimensions from the shape property
  // const rows = sliceNdarray.shape[0];
  // const cols = sliceNdarray.shape[1];

  // // Initialize the 2D TypeScript array
  // const normal2DArray: number[][] = [];

  // // Loop through rows and columns to reconstruct the 2D array
  // for (let r = 0; r < rows; r++) {
  //   const row: number[] = [];
  //   for (let c = 0; c < cols; c++) {
  //     row.push(sliceNdarray.get(r, c)); // Safely get the value at [row, col]
  //   }
  //   normal2DArray.push(row);
  // }
  // console.log(normal2DArray);

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
      {/* <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SliceRenderer
          slicearray={normal2DArray} //plane === Plane.Z ? [].slice.call(slice2D) : array}
          // uintarray={sliceData}
        />
      </Box> */}
      <HeatmapPlot
        aspect="auto"
        plotConfig={{
          title: "Slice View",
          // xLabel: "x-axis",
          // yLabel: "y-axis",
        }}
        values={sliceNdarray}
        domain={[0, 255]}
        colourMap="Spectral"
      />
    </Box>
  );
}
