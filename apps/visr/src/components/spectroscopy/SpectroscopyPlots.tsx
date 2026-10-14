import { ImagePlot } from "@diamondlightsource/davidia";
import { useSpectroscopyData } from "./useSpectroscopyData";
import { useMemo, type ComponentProps } from "react";
import { Box } from "@mui/material";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
] as const;

interface SpectroscopyPlotsProps {
  expanded: boolean;
  plotAspectRatio: ComponentProps<typeof ImagePlot>["aspect"];
}

function SpectroscopyPlots({
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const { data: channels } = useSpectroscopyData();

  const plots = useMemo(
    () =>
      CHANNELS.map(({ key, label }) => (
        <Box
          key={key}
          sx={{
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            // davidia wraps every plot in a hardcoded <div> with no height,
            // which breaks the size chain. This gives it one.
            "& > div": { height: "100%" },
          }}
        >
          <ImagePlot
            aspect={plotAspectRatio}
            plotConfig={{
              title: label,
              xValues: channels.xValues,
              yValues: channels.yValues,
            }}
            customToolbarChildren={null}
            values={channels[key]}
          />
        </Box>
      )),
    [channels, plotAspectRatio],
  );

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        // below this the TabbedPanel scroller takes over
        minHeight: expanded ? 500 : 250,
        display: "grid",
        // open: 3 across. Closed: 2 on top, the third wraps underneath.
        gridTemplateColumns: `repeat(${expanded ? 2 : 3}, minmax(0, 1fr))`,
        gridAutoRows: "minmax(0, 1fr)", // rows share our height equally
        gap: 1,
      }}
    >
      {plots}
    </Box>
  );
}

export default SpectroscopyPlots;
