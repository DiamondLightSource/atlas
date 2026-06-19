import {
  Box,
  Button,
  LinearProgress,
  Slider,
  Stack,
  TextField,
} from "@mui/material";

interface Props {
  onRun: () => void;
  onReset: () => void;
  onSlide: (event: Event, newValue: number | number[]) => void;
  progress: number;
}

export default function Controls({ onRun, onReset, onSlide, progress }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        px: 2,
        py: 1.25,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="angles"
          type="number"
          size="small"
          defaultValue={360}
          sx={{ width: 100 }}
        />
        <Button variant="contained" size="small" onClick={onRun}>
          Run
        </Button>
        <Button variant="contained" size="small" onClick={onReset}>
          Reset
        </Button>

        <Box sx={{ flex: 1 }} />

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
        <Slider
          shiftStep={1}
          step={1}
          min={1}
          max={127}
          marks
          onChange={onSlide}
        ></Slider>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}
