import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Typography,
} from "@mui/material";
import { Plane, maxSliceFor } from "./plane";

interface Props {
  onSlide: (event: Event, newValue: number | number[]) => void;
  onSetDirection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onThreshold: (event: Event, newValue: number | number[]) => void;
  plane: Plane;
  slice: number;
  threshold: number;
  /** Not yet known while the volume loads: the sliders wait for it */
  volumeShape?: [number, number, number];
}

export default function Controls({
  onSlide,
  onSetDirection,
  onThreshold,
  plane,
  slice,
  threshold,
  volumeShape,
}: Props) {
  const loading = !volumeShape;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        General
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Threshold
        </Typography>
        <Slider
          min={0}
          max={254}
          step={1}
          value={threshold}
          disabled={loading}
          onChange={onThreshold}
          valueLabelDisplay="auto"
          aria-label="Threshold"
        />
      </Box>

      <Typography variant="subtitle1" fontWeight={600}>
        Cross-section
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Slice
        </Typography>
        <Slider
          shiftStep={1}
          step={1}
          min={0}
          max={volumeShape ? maxSliceFor(volumeShape, plane) : 0}
          disabled={loading}
          marks
          valueLabelDisplay="auto"
          onChange={onSlide}
          value={slice}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Axis
        </Typography>
        <RadioGroup row value={plane} onChange={onSetDirection}>
          <FormControlLabel value={Plane.X} control={<Radio />} label="X" />
          <FormControlLabel value={Plane.Y} control={<Radio />} label="Y" />
          <FormControlLabel value={Plane.Z} control={<Radio />} label="Z" />
        </RadioGroup>
      </Box>
    </Box>
  );
}

{
  /* <ToggleButton
    value="revolve"
    selected={revolve}
    size="small"
    onChange={() => onRevolveChange(!revolve)}
    color="secondary"
    sx={{ textTransform: "none" }}
  >
    Revolve
  </ToggleButton> */
}
