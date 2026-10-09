import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { DataSource } from "./dataSource";

interface Props {
  onSetDataSource: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataSource: DataSource;
}

export default function Controls({ onSetDataSource, dataSource }: Props) {
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
    </Box>
  );
}
