import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
import { useState } from "react";
import { NumberInput } from "../NumberInput";
import { Box } from "@mui/material";
import { visitToText, VisitInput } from "@diamondlightsource/sci-react-ui";
import { visitTextToVisit } from "../../utils/common";

export type SpectroscopyFormData = {
  total_number_of_scan_points: number;
  grid_size: number;
  grid_origin_x: number;
  grid_origin_y: number;
  exposure_time: number;
};

export function SpectroscopyForm() {
  const { instrumentSession, setInstrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<SpectroscopyFormData>({
    total_number_of_scan_points: 25,
    grid_size: 5.0,
    grid_origin_x: 0.0,
    grid_origin_y: 0.0,
    exposure_time: 0.1,
  });
  const minValue = -14.5;
  const maxValue = 14.5;

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          gap: 3,
          flexGrow: 1,
        }}
      >
        <NumberInput
          label="Grid Origin x"
          numberMode="scientific"
          defaultValue={formData["grid_origin_x"]}
          onCommit={parsedValue => {
            setFormData({ ...formData, ["grid_origin_x"]: parsedValue });
          }}
          minValue={minValue}
          maxValue={maxValue}
        />
        <NumberInput
          label="Grid Origin y"
          numberMode="scientific"
          defaultValue={formData["grid_origin_y"]}
          onCommit={parsedValue => {
            setFormData({ ...formData, ["grid_origin_y"]: parsedValue });
          }}
          minValue={minValue}
          maxValue={maxValue}
        />
        <NumberInput
          label="Grid Size"
          numberMode="scientific"
          defaultValue={formData["grid_size"]}
          onCommit={parsedValue => {
            setFormData({ ...formData, ["grid_size"]: parsedValue });
          }}
          minValue={0.1}
          maxValue={15}
        />
        <NumberInput
          label="Number of Points"
          numberMode="natural"
          defaultValue={formData["total_number_of_scan_points"]}
          onCommit={parsedValue => {
            setFormData({
              ...formData,
              ["total_number_of_scan_points"]: parsedValue,
            });
          }}
          minValue={1}
        />
        <NumberInput
          label="Exposure Time"
          numberMode="scientific"
          defaultValue={formData["exposure_time"]}
          onCommit={parsedValue => {
            setFormData({ ...formData, ["exposure_time"]: parsedValue });
          }}
          minValue={0.1}
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
      <Box sx={{ mt: 4 }} display={"flex"} justifyContent={"center"}>
        <RunPlanButton
          name="demo_spectroscopy"
          params={formData}
          instrumentSession={instrumentSession}
        />
      </Box>
      <Box sx={{ mt: 4 }} display={"flex"} justifyContent={"center"}>
        <AbortButton />
      </Box>
    </Box>
  );
}
