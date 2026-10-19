import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataSource } from "./dataSource";
import { PLOT_KINDS } from "./plotKinds";
import type { PlotKind } from "./useSpectroscopyData";

interface Props {
  onSetDataSource: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataSource: DataSource;
  onSetPlotKind: (kind: PlotKind) => void;
  plotKind: PlotKind;
}

export default function Controls({
  onSetDataSource,
  dataSource,
  onSetPlotKind,
  plotKind,
}: Props) {
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
          Plot Type
        </Typography>
        <RadioGroup
          value={plotKind}
          onChange={event => onSetPlotKind(event.target.value as PlotKind)}
        >
          {PLOT_KINDS.map(({ kind, label, help }) => (
            <Tooltip key={kind} title={help} placement="left" describeChild>
              <FormControlLabel
                value={kind}
                control={<Radio />}
                label={label}
              />
            </Tooltip>
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
}
