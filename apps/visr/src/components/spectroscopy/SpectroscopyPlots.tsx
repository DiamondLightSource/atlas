import { ImagePlot } from "@diamondlightsource/davidia";
import { useSpectroscopyData, type PlotKind } from "./useSpectroscopyData";
import { useMemo, useState, type ComponentProps } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

const CHANNELS = [
  { key: "red", label: "Red channel" },
  { key: "green", label: "Green channel" },
  { key: "blue", label: "Blue channel" },
] as const;

/** The ways a scan can be drawn, with what each shows */
const PLOT_KINDS: { kind: PlotKind; label: string; help: string }[] = [
  {
    kind: "cells",
    label: "Cells",
    help: "The scan's grid cells, each the mean of the points in it",
  },
  {
    kind: "rectangles",
    label: "Rectangles",
    help: "A step-sized rectangle on each recorded position",
  },
  {
    kind: "gaussian",
    label: "Gaussian",
    help: "A beam-sized Gaussian on each point: gaps the beam didn't cover show",
  },
  {
    kind: "ovals",
    label: "Footprints",
    help: "Each point's beam footprint, overlaps split between neighbours",
  },
];

interface SpectroscopyPlotsProps {
  expanded: boolean;
  plotAspectRatio: ComponentProps<typeof ImagePlot>["aspect"];
}

function SpectroscopyPlots({
  expanded,
  plotAspectRatio,
}: SpectroscopyPlotsProps) {
  const [kind, setKind] = useState<PlotKind>("cells");
  const { data: channels } = useSpectroscopyData(kind);

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
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        value={kind}
        onChange={(_, value: PlotKind | null) => value && setKind(value)}
        aria-label="How the scan is drawn"
        sx={{ alignSelf: "center" }}
      >
        {PLOT_KINDS.map(({ kind, label, help }) => (
          <Tooltip key={kind} title={help} describeChild>
            <ToggleButton value={kind}>{label}</ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          // open: 3 across. Closed: 2 on top, the third wraps underneath.
          gridTemplateColumns: `repeat(${expanded ? 2 : 3}, minmax(0, 1fr))`,
          gridAutoRows: "minmax(0, 1fr)", // rows share our height equally
          gap: 1,
        }}
      >
        {plots}
      </Box>
    </Box>
  );
}

export default SpectroscopyPlots;
