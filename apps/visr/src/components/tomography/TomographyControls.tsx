import {
  Box,
  Button,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Plane } from "./PlaneEnum";

interface Props {
  onRun: () => void;
  onReset: () => void;
  onSlide: (event: Event, newValue: number | number[]) => void;
  onSetDirection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  plane: Plane;
  progress: number;
  slice: number;
  volumeShape: [number, number, number];
}

export default function Controls({
  onRun,
  onReset,
  onSlide,
  onSetDirection,
  plane,
  progress,
  slice,
  volumeShape,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ flex: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="primary" padding={1}>
            Reconstruction
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="angles"
              type="number"
              size="small"
              defaultValue={360}
              sx={{ width: 100, padding: 1 }}
            />
            <Button variant="contained" size="small" onClick={onRun}>
              Run
            </Button>
            <Button variant="contained" size="small" onClick={onReset}>
              Reset
            </Button>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 100 }}
          />
        </Box>
        <Box sx={{ flex: 0.2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="primary">
            Slice View
          </Typography>
          <Typography variant="body1" color="primary">
            Slice
          </Typography>
          <Slider
            shiftStep={1}
            step={1}
            min={0}
            max={
              plane === Plane.Z
                ? volumeShape[0] - 1
                : plane === Plane.Y
                  ? volumeShape[1] - 1
                  : volumeShape[2] - 1
            }
            marks
            onChange={onSlide}
            value={slice}
          ></Slider>
          <Typography variant="body1" color="primary">
            Axis
          </Typography>
          <RadioGroup row value={plane} onChange={onSetDirection}>
            <FormControlLabel value={Plane.X} control={<Radio />} label="X" />
            <FormControlLabel value={Plane.Y} control={<Radio />} label="Y" />
            <FormControlLabel value={Plane.Z} control={<Radio />} label="Z" />
          </RadioGroup>
        </Box>
      </Stack>
      {/* <Box sx={{ flex: 1 }} /> */}

      {/* <ToggleButton
          value="revolve"
          selected={revolve}
          size="small"
          onChange={() => onRevolveChange(!revolve)}
          color="secondary"
          sx={{ textTransform: "none" }}
        >
          Revolve
        </ToggleButton> */}
    </Box>
  );
}
