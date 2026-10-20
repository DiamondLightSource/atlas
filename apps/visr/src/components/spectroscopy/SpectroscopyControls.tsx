import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataSource } from "./dataSource";
import {
  POSITIONS,
  READBACK_ONLY_HELP,
  SHAPES,
  type Positions,
  type Shape,
} from "./plotKinds";

interface Props {
  onSetDataSource: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataSource: DataSource;
  positions: Positions;
  onSetPositions: (positions: Positions) => void;
  /** The shape for readbacks, kept while the setpoint grid is shown */
  shape: Shape;
  onSetShape: (shape: Shape) => void;
}

export default function Controls({
  onSetDataSource,
  dataSource,
  positions,
  onSetPositions,
  shape,
  onSetShape,
}: Props) {
  const onGrid = positions === "setpoints";
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
        Plots
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="primary">
          Data Source
        </Typography>
        <RadioGroup row value={dataSource} onChange={onSetDataSource}>
          <FormControlLabel
            value={DataSource.Camera}
            control={<Radio />}
            label="Camera"
          />
          <FormControlLabel
            value={DataSource.Diodes}
            control={<Radio />}
            label="Diodes"
          />
        </RadioGroup>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="primary">
          Positions
        </Typography>
        <RadioGroup
          row
          value={positions}
          onChange={event => onSetPositions(event.target.value as Positions)}
        >
          {POSITIONS.map(({ value, label, help }) => (
            <Tooltip key={value} title={help} describeChild>
              <FormControlLabel
                value={value}
                control={<Radio />}
                label={label}
              />
            </Tooltip>
          ))}
        </RadioGroup>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="primary">
          Plot Type
        </Typography>
        <RadioGroup
          row
          // the setpoint grid's cells are rectangles
          value={onGrid ? "rectangles" : shape}
          onChange={event => onSetShape(event.target.value as Shape)}
        >
          {SHAPES.map(({ value, label, help }) => {
            const disabled = onGrid && value !== "rectangles";
            return (
              <Tooltip
                key={value}
                title={disabled ? READBACK_ONLY_HELP : help}
                describeChild
              >
                {/* a span, so the tooltip still shows on a disabled option */}
                <span>
                  <FormControlLabel
                    value={value}
                    control={<Radio />}
                    label={label}
                    disabled={disabled}
                  />
                </span>
              </Tooltip>
            );
          })}
        </RadioGroup>
      </Box>
    </Box>
  );
}
