import { Box, MenuItem, TextField, Typography } from "@mui/material";
import type { Reconstruction } from "./reconstruction";

interface Props {
  reconstructions: Reconstruction[];
  selected: string | null;
  onSelect: (path: string) => void;
}

/** Picks which reconstruction in Tiled the viewer shows */
export default function ReconstructionSelect({
  reconstructions,
  selected,
  onSelect,
}: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      <Typography variant="overline" color="primary">
        Reconstruction
      </Typography>
      <TextField
        select
        size="small"
        label="Volume"
        value={selected ?? ""}
        onChange={e => onSelect(e.target.value)}
        disabled={reconstructions.length === 0}
        helperText={
          reconstructions.length === 0 ? "No reconstructions in Tiled" : " "
        }
      >
        {reconstructions.map(r => (
          <MenuItem key={r.path} value={r.path}>
            {r.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
