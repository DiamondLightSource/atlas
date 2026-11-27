import { Box } from "@mui/material";
import { HeatmapPlot } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useLayoutEffect, useState } from "react";
import createArrayFromView from "../../utils/createArrayFromView";

// Not importing Plane in case we move SliceViewer somewhere else as a generic component
enum Plane {
  X,
  Y,
  Z,
}

interface Props {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  plane: Plane;
  slice: number;
  threshold?: number; // raw 0–255; values at or below render as the bottom of the colormap
  resizeKey?: string; //if this depends on a value, the plot will remount every time that value changes. If no need for it to remound, leave as undefined
  /** The colour scale beside the plot; without it, the plot takes its room */
  colourBar?: boolean;
}

// h5web draws the colour bar in every heatmap, with no option to leave it
// out, so it is hidden by its class. The class carries a build hash
// ("_colorBar_b9941fe"), so match the start of it
const COLOUR_BAR = "[class*='_colorBar_']";

// The heatmap's axis margins, as davidia lays them out with no axis labels or
// title: the image sits inside these
const MARGIN = { left: 80, right: 24, top: 16, bottom: 34 };

type Size = { width: number; height: number };

/** The size of the element the returned ref is on, kept up to date */
function useSize() {
  // a ref callback, so the element is watched whenever it mounts
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, size] as const;
}

/**
 * Where to put the plot so its image is as big as fits, flush with the axes:
 * davidia's tightAxes does this for image plots, but heatmaps don't have it.
 * Placed to line up with image plots in a PlotCell with balanceAxes
 */
function tightFrame(space: Size, rows: number, cols: number) {
  const across = MARGIN.left + MARGIN.right;
  const down = MARGIN.top + MARGIN.bottom;
  const imageWidth = Math.max(
    0,
    Math.min(space.width - across, ((space.height - down) * cols) / rows),
  );
  const imageHeight = (imageWidth * rows) / cols;
  const width = imageWidth + across;
  const height = imageHeight + down;
  // across, the plot is centred, as an image plot is (balanceAxes then
  // centres the image). Down, the image is centred in any room left over;
  // when it fills the height, that puts it at the top, as an image plot is
  const top = Math.max(
    0,
    Math.min(
      space.height - height,
      (space.height - imageHeight) / 2 - MARGIN.top,
    ),
  );
  return { width, height, left: (space.width - width) / 2, top };
}
export default function SliceViewer({
  volumeData,
  volumeShape,
  plane,
  slice,
  threshold = 0,
  resizeKey,
  colourBar = true,
}: Props) {
  const [spaceRef, space] = useSize();
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

  // Tight only without the colour bar, which would need room of its own
  const [rows, cols] = sliceNdarray.shape;
  const frame =
    !colourBar && space && rows > 0 && cols > 0
      ? tightFrame(space, rows, cols)
      : null;

  return (
    <Box
      ref={spaceRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...(!colourBar && { [`& ${COLOUR_BAR}`]: { display: "none" } }),
      }}
    >
      <Box
        sx={{
          position: "absolute",
          ...(frame ?? { left: 0, top: 0, width: "100%", height: "100%" }),
          // davidia's wrapper has no height of its own
          "& > div": { height: "100%", minWidth: 0, minHeight: 0 },
        }}
      >
        <HeatmapPlot
          key={resizeKey}
          aspect={"equal"}
          plotConfig={{}}
          values={sliceNdarray}
          domain={[threshold, 255]}
          customToolbarChildren={null}
        />
      </Box>
    </Box>
  );
}
