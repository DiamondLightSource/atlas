import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
import { ScanType } from "../scanType";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import {
  Box,
  FormControl,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

enum LightSource {
  LED = "led",
  SR = "sr",
  DARK = "dark",
}

export type TomographyFormData = {
  scan_type: ScanType;
  number_of_projections: number;
  light_source: LightSource;
  exposure_time: number;
};

export function TomographyForm() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<TomographyFormData>({
    scan_type: ScanType.STEP,
    number_of_projections: 360,
    light_source: LightSource.LED,
    exposure_time: 0.1,
  });
  const minProjections = 30;
  const maxProjections = 1440;

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
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          columnGap: 3,
          rowGap: 4,
          alignItems: "start",
          pt: 2,
        }}
      >
        <NumberInput
          label="Number of Projections"
          numberMode="natural"
          defaultValue={formData.number_of_projections}
          onCommit={v => setField("number_of_projections", v)}
          minValue={minProjections}
          maxValue={maxProjections}
        />
        <NumberInput
          label="Exposure Time"
          numberMode="scientific"
          defaultValue={formData.exposure_time}
          onCommit={v => setField("exposure_time", v)}
          minValue={0.1}
        />
        <FormControl fullWidth sx={{ position: "relative" }}>
          <FormLabel
            id="light-source-label"
            sx={{
              position: "absolute",
              top: -24,
              left: 0,
              fontSize: "0.875rem",
            }}
          >
            Light Source
          </FormLabel>
          <ToggleButtonGroup
            exclusive
            fullWidth
            aria-labelledby="light-source-label"
            value={formData.light_source}
            onChange={(_, v) => v && setField("light_source", v)}
          >
            <ToggleButton value={LightSource.LED}>LED</ToggleButton>
            <ToggleButton value={LightSource.SR}>Synchrotron</ToggleButton>
            <ToggleButton value={LightSource.DARK}>Off</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
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
          name="tomography"
          params={formData}
          instrumentSession={instrumentSession}
          buttonText="Run"
        />
        <AbortButton />
      </Box>

      {/* Darks/flats */}
      <Box
        sx={{
          ...sectionSx,
        }}
      >
        <RunPlanButton
          name="darks_flats"
          params={{
            light_source: formData.light_source,
            exposure_time: formData.exposure_time,
          }}
          instrumentSession={instrumentSession}
          buttonText="Acquire Darks/Flats"
        />
      </Box>
    </Box>
  );
}
