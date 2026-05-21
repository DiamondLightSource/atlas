import { ImagePlot } from "@diamondlightsource/davidia";
import { useSpectroscopyData } from "./useSpectroscopyData";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import { useMemo } from "react";
import { Box } from "@mui/material";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
] as const;

interface SpectroscopyPlotsProps {
  expanded: boolean;
  plotAspectRatio: number;
}

function SpectroscopyPlots({
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { data: channels } = useSpectroscopyData();
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
  ];

  const plots = useMemo(
    () =>
      CHANNELS.map(({ key, label }, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <ImagePlot
            key={i}
            aspect={plotAspectRatio}
            plotConfig={{
              title: label,
              xValues: channels.xValues,
              yValues: channels.yValues,
            }}
            customToolbarChildren={null}
            values={channels[key]}
            // tightAxes //requires Davidia 1.1.0
          />
        </Box>
      )),
    [channels, plotAspectRatio],
  );

  return (
    <Box ref={containerRef! as React.RefObject<HTMLDivElement>}>
      {mounted && (
        <ReactGridLayout
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
