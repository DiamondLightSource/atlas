import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";
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
        maxWidth: 600,
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
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
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
        <RunPlanButton
          name="calibration"
          params={formData}
          instrumentSession={instrumentSession}
          buttonText="Take Dark/Flat"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pt: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <AbortButton />
      </Box>
    </Box>
  );
}
