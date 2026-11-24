import { useInstrumentSession } from "@atlas/app-shell";
import { RunPlanButton } from "@atlas/blueapi-ui";
import FormFieldset from "../FormFieldset";
import { useWorkerBusy } from "../../hooks/useWorkerBusy";
import { ScanType } from "../scanType";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";
import ScanTypeField from "../ScanTypeField";

export type TomographyFormData = {
  scan_type: ScanType;
  number_of_projections: number;
  exposure_time: number;
};

export function TomographyForm() {
  const { instrumentSession } = useInstrumentSession();
  // no changes under a running plan
  const busy = useWorkerBusy();
  const [formData, setFormData] = useState<TomographyFormData>({
    scan_type: ScanType.STEP,
    number_of_projections: 360,
    exposure_time: 0.1,
  });
  const minProjections = 30;
  const maxProjections = 1440;

  const setField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => setFormData(prev => ({ ...prev, [key]: value }));

  const sectionSx = { pt: 2, borderTop: 1, borderColor: "divider" };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        "& .MuiButton-root": {
          width: "100%",
          height: 56,
          whiteSpace: "nowrap",
        },
      }}
    >
      {/* Parameters */}
      <FormFieldset disabled={busy}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 2,
            alignItems: "start",
          }}
        >
          <ScanTypeField
            value={formData.scan_type}
            onChange={v => setField("scan_type", v)}
            disabled={busy}
          />
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
        </Box>
      </FormFieldset>

      {/* The scan's one action, after everything it runs with */}
      <Box sx={sectionSx}>
        <RunPlanButton
          name="demo_tomography"
          params={formData}
          instrumentSession={instrumentSession}
          buttonText="Run"
        />
      </Box>
    </Box>
  );
}
