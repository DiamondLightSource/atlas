import { ImagePlot, type NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useSpectroscopyData, type RGBColour } from "./useSpectroscopyData";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import { useMemo, type ComponentProps } from "react";
import { Box } from "@mui/material";

function toNDT(matrix: (number | null)[][], colour: RGBColour): NDT {
  if (!matrix?.length || !matrix[0]?.length) {
    return EMPTY_NDT; // skip invalid input
  }
  const height = matrix.length;
  const width = matrix[0].length;

  // Flatten and filter out nulls for normalisation
  const flat = matrix.flat();
  const valid = flat.filter((v): v is number => v !== null && !isNaN(v));

  // Avoid crashes when no valid values
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 1;
  const scale = max > min ? 255 / (max - min) : 1;

  const rgb = new Uint8Array(width * height * 3);

  for (let i = 0; i < flat.length; i++) {
    const v = flat[i];
    let scaled = 0;
    if (v !== null && !isNaN(v)) {
      scaled = Math.round((v - min) * scale);
    } // else stays 0 (black)

    switch (colour) {
      case "red":
        rgb[i * 3] = scaled;
        break;
      case "green":
        rgb[i * 3 + 1] = scaled;
        break;
      case "blue":
        rgb[i * 3 + 2] = scaled;
        break;
      case "gray":
        rgb[i * 3] = scaled;
        rgb[i * 3 + 1] = scaled;
        rgb[i * 3 + 2] = scaled;
        break;
    }
  }

  return ndarray(rgb, [height, width, 3]) as NDT;
}
/** Placeholder empty gray dataset */
const EMPTY_NDT = toNDT([[0]], "gray");

/** Return type of `/api/data/map` */
interface MapResponse {
  values: (number | null)[][];
}

async function fetchMap(
  filepath: string,
  datapath: string,
  colour: RGBColour,
  snake: boolean,
) {
  const url = `/api/data/map?filepath=${encodeURIComponent(filepath)}&datapath=${encodeURIComponent(datapath)}&snake=${encodeURIComponent(snake)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(resp.statusText);
  const mapResponse: MapResponse = await resp.json();
  return toNDT(mapResponse.values, colour);
}

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
  //{ key: "gray", label: "Gray channel" }, // using gray channel to stop typing errors
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
export type SpectroscopyData = Partial<Record<ChannelKey, PlotValues>>;

interface SpectroscopyPlotsProps {
  expanded: boolean;
  plotAspectRatio: number | "auto" | "equal";
}

function SpectroscopyPlots({
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { data: channels } = useSpectroscopyData(fetchMap);
  const { width, containerRef, mounted } = useContainerWidth();
  const h = 10;
  const w = 1;

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h, static: true },
    { i: "1", x: 1, y: 0, w: w, h: h, static: true },
    {
      i: "2",
      x: !expanded ? 2 : 0,
      y: !expanded ? 0 : h,
      w: w,
      h: h,
      static: true,
    },
    // { i: "3", x: !expanded ? 3 : 1, !expanded ? 0 : h, w: w, h: h, static: true },
  ];

  const plots = useMemo(
    () =>
      CHANNELS.map(({ key }, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            minHeight: 0,
            minWidth: 260,
            display: "grid",
          }}
          // sx={{
          //   display: "grid", //this makes the plots fill the parent box
          //   //display: "flex", //this fixes the centering issue of the plots when drawer is closed
          //   flex: 1, //this option fixes the sizing issue when the window is resized
          //   justifyContent: "center",
          //   minWidth: 260,
          // }}
        >
          <ImagePlot
            key={i}
            aspect={plotAspectRatio}
            plotConfig={{ title: key + " channel" }}
            customToolbarChildren={null}
            values={channels[key] ?? EMPTY_NDT}
            //tightAxes //requires Davidia 1.1.0
          />
        </Box>
      )),
    [channels, plotAspectRatio],
  );

  return (
    <Box
      ref={containerRef! as React.RefObject<HTMLDivElement>}
      sx={{ display: "grid" }}
    >
      {mounted && (
        <ReactGridLayout
          //key={width} //re-render the grid on width change so that plots resize correctly
          layout={layout}
          width={width}
          gridConfig={{
            cols: !expanded ? plots.length : 2,
            rowHeight: 25,
            margin: [10, 10],
          }}
        >
          {plots}
        </ReactGridLayout>
      )}
    </Box>
  );
}

export default SpectroscopyPlots;
