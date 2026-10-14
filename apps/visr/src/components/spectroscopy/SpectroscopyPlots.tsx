import {
  ImagePlot,
  type SelectionsEventListener,
} from "@diamondlightsource/davidia";
import {
  useSpectroscopyData,
  type PlotKind,
  type Region,
} from "./useSpectroscopyData";
import { beamWarning, PLOT_KINDS } from "./plotKinds";
import { describeRegion, selectionToRegion } from "./region";
import { describeOffset, describeProgress, percentDone } from "./progress";
import RegionSelectMode from "./RegionSelectMode";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";

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
  const [kind, setKind] = useState<PlotKind>("cells");
  const [region, setRegion] = useState<Region | undefined>();
  const [picking, setPicking] = useState(false);
  const { data: channels, uuid } = useSpectroscopyData(kind, region);
  const progress = channels.progress;
  const percent = progress && percentDone(progress);

  // a new scan starts on the whole of it
  useEffect(() => {
    setRegion(undefined);
    setPicking(false);
  }, [uuid]);

  /** A rectangle drawn on any of the plots becomes the region all of them show */
  const onSelection = useCallback<SelectionsEventListener>(
    (type, dragging, selection) => {
      // SelectionsEventType is only declared, not exported, so by its value
      if (String(type) !== "created" || dragging || !selection) {
        return;
      }
      const picked = selectionToRegion(selection);
      // Davidia calls this while it renders, so update after that
      queueMicrotask(() => {
        if (picked) setRegion(picked);
        setPicking(false);
      });
    },
    [],
  );

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
            // The toolbar only carries RegionSelectMode, which draws nothing
            "& > div > div:first-of-type:not(:last-child)": { display: "none" },
          }}
        >
          <ImagePlot
            aspect={plotAspectRatio}
            plotConfig={{
              title: label,
              xValues: channels.xValues,
              yValues: channels.yValues,
            }}
            customToolbarChildren={<RegionSelectMode active={picking} />}
            selectionOptions={{ rectangle: 1 }}
            selectionsListener={onSelection}
            values={channels[key]}
          />
        </Box>
      )),
    [channels, plotAspectRatio, picking, onSelection],
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
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ alignSelf: "center", alignItems: "center", flexWrap: "wrap" }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={kind}
          onChange={(_, value: PlotKind | null) => value && setKind(value)}
          aria-label="How the scan is drawn"
        >
          {PLOT_KINDS.map(({ kind, label, help }) => (
            <Tooltip key={kind} title={help} describeChild>
              <ToggleButton value={kind}>{label}</ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
        <Tooltip
          title="Drag a rectangle on any plot to show just that part of the scan, in full detail"
          describeChild
        >
          <ToggleButton
            size="small"
            value="pick"
            selected={picking}
            onChange={() => setPicking(p => !p)}
          >
            <CropFreeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Pick region
          </ToggleButton>
        </Tooltip>
        {region && (
          <Tooltip title="Remove to show the whole scan again">
            <Chip
              label={`Showing ${describeRegion(region)}`}
              onDelete={() => setRegion(undefined)}
            />
          </Tooltip>
        )}
      </Stack>
      {progress && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", px: 1 }}
          aria-label="Scan progress"
        >
          {percent !== null && (
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{ flex: 1, maxWidth: 400 }}
              aria-label={describeProgress(progress)}
            />
          )}
          <Typography variant="body2" color="text.secondary">
            {describeProgress(progress)}
          </Typography>
          {describeOffset(progress) && (
            <Typography variant="body2" color="text.secondary">
              · {describeOffset(progress)}
            </Typography>
          )}
        </Stack>
      )}
      {beamWarning(kind, channels.beam) && (
        <Alert severity="warning" sx={{ alignSelf: "center", py: 0 }}>
          {beamWarning(kind, channels.beam)}
        </Alert>
      )}
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
