import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useId } from "react";
import { ScanType } from "./scanType";

interface ScanTypeFieldProps {
  value: ScanType;
  onChange: (value: ScanType) => void;
  disabled?: boolean;
}

/** Step or fly, as a labelled parameter of the scan */
export function ScanTypeField({
  value,
  onChange,
  disabled,
}: ScanTypeFieldProps) {
  const labelId = useId();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography id={labelId} variant="body2" color="text.secondary">
        Scan type
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        aria-labelledby={labelId}
        disabled={disabled}
        value={value}
        onChange={(_, next: ScanType | null) => next && onChange(next)}
      >
        <ToggleButton value={ScanType.STEP}>Step</ToggleButton>
        <ToggleButton value={ScanType.FLY}>Fly</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default ScanTypeField;
