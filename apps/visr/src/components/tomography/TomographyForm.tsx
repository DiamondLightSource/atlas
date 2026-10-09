import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
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
  number_of_projections: number;
  light_source: LightSource;
  exposure_time: number;
};

export function TomographyForm() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<TomographyFormData>({
    number_of_projections: 360,
    light_source: LightSource.LED,
    exposure_time: 0.1,
  });
  const minProjections = 30;
  const maxProjections = 1440;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      {/* Line one */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          columnGap: 3,
          rowGap: 4,
          alignItems: "start",
          pt: 2,
        }}
      >
        <NumberInput
          label="Number of Projections"
          defaultValue={formData["number_of_projections"]}
          numberMode="natural"
          onCommit={parsedValue =>
            setFormData(prev => ({
              ...prev,
              number_of_projections: parsedValue,
            }))
          }
          minValue={minProjections}
          maxValue={maxProjections}
        />
        <NumberInput
          label="Exposure Time"
          numberMode="scientific"
          defaultValue={formData["exposure_time"]}
          onCommit={parsedValue =>
            setFormData(prev => ({ ...prev, exposure_time: parsedValue }))
          }
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
            onChange={(_, value: LightSource | null) =>
              value && setFormData(prev => ({ ...prev, light_source: value }))
            }
            sx={{ height: 56 }}
          >
            <ToggleButton value={LightSource.LED}>LED</ToggleButton>
            <ToggleButton value={LightSource.SR}>Synchrotron</ToggleButton>
            <ToggleButton value={LightSource.DARK}>Off</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Box>

      {/* Line two */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          pt: 3,
          borderTop: 1,
          borderColor: "divider",
          "& .MuiButton-root": {
            width: "100%",
            height: 40,
            whiteSpace: "nowrap",
          },
        }}
      >
        <RunPlanButton
          name="tomography"
          params={{ ...formData, fly: false }}
          instrumentSession={instrumentSession}
          buttonText="Step Scan"
        />
        <RunPlanButton
          name="tomography"
          params={{ ...formData, fly: true }}
          instrumentSession={instrumentSession}
          buttonText="Fly Scan"
        />
        <Box
          sx={{
            "& .MuiButton-root": {
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            },
          }}
        >
          <RunPlanButton
            name="darks_flats"
            params={{ light_source: formData.light_source }}
            instrumentSession={instrumentSession}
            buttonText="Acquire Darks/Flats"
          />
        </Box>
      </Box>

      {/* Line three */}
      <Box sx={{ "& .MuiButton-root": { width: "100%", height: 40 } }}>
        <AbortButton />
      </Box>
    </Box>
  );
}
