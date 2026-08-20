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
import { visitToText, VisitInput } from "@diamondlightsource/sci-react-ui";
import { visitTextToVisit } from "../../utils/common";

enum LightSource {
  LED = "led",
  SR = "sr",
  DARK = "dark",
}

export type TomographyFormData = {
  number_of_projections: number;
  light_source: LightSource;
};

export function TomographyForm() {
  const { instrumentSession, setInstrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<TomographyFormData>({
    number_of_projections: 360,
    light_source: LightSource.LED,
  });
  const minProjections = 30;
  const maxProjections = 1440;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <NumberInput
          label="Number of Projections"
          defaultValue={formData["number_of_projections"]}
          numberMode="natural"
          onCommit={parsedValue => {
            setFormData({
              ...formData,
              ["number_of_projections"]: parsedValue,
            });
          }}
          minValue={minProjections}
          maxValue={maxProjections}
        />
        <VisitInput
          visit={
            visitTextToVisit(instrumentSession) ??
            visitTextToVisit("cm12345-1") ??
            undefined
          }
          onSubmit={visit => setInstrumentSession(visitToText(visit))}
          submitButton={false}
        />
        <FormControl>
          <FormLabel id="light-source-label" sx={{ mb: 1 }}>
            Light Source
          </FormLabel>
          <ToggleButtonGroup
            exclusive
            aria-labelledby="light-source-label"
            value={formData.light_source}
            onChange={(_, value: LightSource | null) =>
              value && setFormData({ ...formData, light_source: value })
            }
          >
            <ToggleButton value={LightSource.LED}>LED</ToggleButton>
            <ToggleButton value={LightSource.SR}>Synchrotron</ToggleButton>
            <ToggleButton value={LightSource.DARK}>Off</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          pt: 1,
          borderTop: 1,
          borderColor: "divider",
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
            ml: "auto",
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

      <Box
        sx={{
          display: "flex",
        }}
      >
        <AbortButton />
      </Box>
    </Box>
  );
}
