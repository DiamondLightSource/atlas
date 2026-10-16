import { useInstrumentSession } from "@atlas/app-shell";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
import { ScanType } from "../scanType";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

export type SpectroscopyFormData = {
  scan_type: ScanType;
  total_number_of_scan_points: number;
  grid_size: number;
  grid_origin_x: number;
  grid_origin_y: number;
  exposure_time: number;
};

export function SpectroscopyForm() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<SpectroscopyFormData>({
    scan_type: ScanType.STEP,
    total_number_of_scan_points: 25,
    grid_size: 5.0,
    grid_origin_x: 0.0,
    grid_origin_y: 0.0,
    exposure_time: 0.1,
  });
  const minValue = -14.5;
  const maxValue = 14.5;

  const setField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => setFormData(prev => ({ ...prev, [key]: value }));

  const sectionSx = { pt: 3, borderTop: 1, borderColor: "divider" };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 3,
        "& .MuiButton-root": {
          width: "100%",
          height: 56,
          whiteSpace: "nowrap",
        },
        "& .MuiToggleButtonGroup-root": { height: 56 },
      }}
    >
      {/* Parameters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* x and y share one cell */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <NumberInput
            label="Grid Origin x"
            numberMode="scientific"
            defaultValue={formData.grid_origin_x}
            onCommit={v => setField("grid_origin_x", v)}
            minValue={minValue}
            maxValue={maxValue}
          />
          <NumberInput
            label="Grid Origin y"
            numberMode="scientific"
            defaultValue={formData.grid_origin_y}
            onCommit={v => setField("grid_origin_y", v)}
            minValue={minValue}
            maxValue={maxValue}
          />
        </Box>
        <NumberInput
          label="Grid Size"
          numberMode="scientific"
          defaultValue={formData.grid_size}
          onCommit={v => setField("grid_size", v)}
          minValue={0.1}
          maxValue={15}
        />
        <NumberInput
          label="Number of Points"
          numberMode="natural"
          defaultValue={formData.total_number_of_scan_points}
          onCommit={v => setField("total_number_of_scan_points", v)}
          minValue={1}
        />
        <NumberInput
          label="Exposure Time"
          numberMode="scientific"
          defaultValue={formData.exposure_time}
          onCommit={v => setField("exposure_time", v)}
          minValue={0.1}
        />
      </Box>

      {/* Scan controls */}
      <Box
        sx={{
          ...sectionSx,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <ToggleButtonGroup
          exclusive
          fullWidth
          aria-label="Scan type"
          value={formData.scan_type}
          onChange={(_, v) => v && setField("scan_type", v)}
        >
          <ToggleButton value={ScanType.STEP}>Step</ToggleButton>
          <ToggleButton value={ScanType.FLY}>Fly</ToggleButton>
        </ToggleButtonGroup>
        <RunPlanButton
          name="spectroscopy"
          params={formData}
          instrumentSession={instrumentSession}
          buttonText="Run"
        />
        <AbortButton />
      </Box>
    </Box>
  );
}
