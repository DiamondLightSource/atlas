import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Typography,
} from "@mui/material";
import { Plane } from "./PlaneEnum";

interface Props {
  onSlide: (event: Event, newValue: number | number[]) => void;
  onSetDirection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  plane: Plane;
  slice: number;
  volumeShape: [number, number, number];
}

export default function Controls({
  onSlide,
  onSetDirection,
  plane,
  slice,
  volumeShape,
}: Props) {
  const maxSlice: Record<Plane, number> = {
    [Plane.Z]: volumeShape[0] - 1,
    [Plane.Y]: volumeShape[1] - 1,
    [Plane.X]: volumeShape[2] - 1,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 3,
      }}
    >
      <Typography variant="overline" color="primary">
        Slice View
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="primary">
          Slice
        </Typography>
        <Slider
          shiftStep={1}
          step={1}
          min={0}
          max={maxSlice[plane]}
          marks
          valueLabelDisplay="auto"
          onChange={onSlide}
          value={slice}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="primary">
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
