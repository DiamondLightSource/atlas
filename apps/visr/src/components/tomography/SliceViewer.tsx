import { Box } from "@mui/material";
import { Plane } from "./PlaneEnum";
import { HeatmapPlot } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import createArrayFromView from "../../utils/createArrayFromView";

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  plane: Plane;
  slice: number;
  resizeKey?: string; //if this depends on a value, the plot will remount every time that value changes. If no need for it to remound, leave as undefined
}
export default function SliceViewer({
  volumeData,
  volumeShape,
  plane,
  slice,
  resizeKey,
}: Props) {
  if (volumeData == undefined || volumeShape == undefined) {
    return <Box />;
  }

  const volume = ndarray(volumeData, volumeShape);
  let sliceNdarray: ndarray.NdArray<Uint8Array>;

  switch (plane) {
    case Plane.Z: {
      sliceNdarray = createArrayFromView(volume.pick(slice, null, null));
      break;
    }
    case Plane.Y: {
      sliceNdarray = createArrayFromView(volume.pick(null, slice, null));
      break;
    }
    case Plane.X: {
      sliceNdarray = createArrayFromView(volume.pick(null, null, slice));
      break;
    }
  }

  return (
    <HeatmapPlot
      key={resizeKey}
      aspect={"equal"}
      plotConfig={{}}
      values={sliceNdarray}
      domain={[0, 255]}
      customToolbarChildren={null}
    />
  );
}
