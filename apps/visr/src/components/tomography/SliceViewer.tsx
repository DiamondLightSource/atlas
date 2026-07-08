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
  slice: number;
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
      <HeatmapPlot
        aspect="auto"
        plotConfig={{}}
        values={sliceNdarray}
        domain={[0, 255]}
        colourMap="Spectral"
      />
    </Box>
  );
}
