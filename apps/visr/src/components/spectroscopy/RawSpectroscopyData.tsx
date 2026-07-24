import { ImagePlot, type NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { useSpectroscopyData, type RGBColour } from "./useSpectroscopyData";
import PlotFrame from "./PlotFrame";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

import { useMemo, type ComponentProps } from "react";

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
  { key: "gray", label: "Gray channel" }, // using gray channel to stop typing errors
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type PlotValues = ComponentProps<typeof ImagePlot>["values"];
export type SpectroscopyData = Partial<Record<ChannelKey, PlotValues>>;

interface RawSpectroscopyDataProps {
  expanded: boolean;
  plotAspectRatio: number;
}

function RawSpectroscopyData({
  expanded,
  plotAspectRatio,
}: RawSpectroscopyDataProps) {
  const { data: channels } = useSpectroscopyData(fetchMap);
  const { width, containerRef, mounted } = useContainerWidth();
  const h = 10;
  const w = 1;

  const layout = [
    { i: "0", x: 0, y: 0, w: w, h: h },
    { i: "1", x: 1, y: 0, w: w, h: h },
    { i: "2", x: expanded ? 0 : 2, y: expanded ? 1 : 0, w: w, h: h },
    { i: "3", x: expanded ? 1 : 3, y: expanded ? 1 : 0, w: w, h: h },
  ];

  const plots = useMemo(
    () =>
      CHANNELS.map(({ key }, i) => (
        <div key={i}>
          <ImagePlot
            key={i}
            aspect={plotAspectRatio}
            plotConfig={{}}
            customToolbarChildren={null}
            values={channels[key] ?? EMPTY_NDT}
          />
        </div>
      )),
    [channels],
  );
  console.log("key", plots[0].key);
  console.log("containerRef", containerRef);

  return (
    <div ref={containerRef! as React.RefObject<HTMLDivElement>}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{
            cols: !expanded ? plots.length : plots.length / 2,
            rowHeight: 20,
          }}
        >
          {plots}
        </ReactGridLayout>
      )}
    </div>
  );
}

export default RawSpectroscopyData;
