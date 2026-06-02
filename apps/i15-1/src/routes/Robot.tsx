import { useInstrumentSession } from "../context/instrumentSession/useInstrumentSession";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import { NumberInput } from "../components/NumberInput";
import RunPlanButton from "../components/RunPlanButton";
import { ReadOnlyPv } from "@atlas/pvws-config";
import { StatusCard } from "../components/StatusCard";

type RobotSampleFormData = {
  puck: number;
  position: number;
};

function StatusSidebar() {
  const theme = useTheme();
  return (
    <Box sx={{ ml: 5 }}>
      <Stack direction={"column"} spacing={2}>
        <StatusCard
          title="Currently loaded"
          bgColor={theme.palette.info.light}
          cardColor={theme.palette.primary.main}
        >
          <ReadOnlyPv label="Puck" pv="ca://BL15J-EA-LOC-01:PUCK:INDEX" />
          <ReadOnlyPv
            label="Sample Pin"
            pv="ca://BL15J-EA-LOC-01:SAMPLE:INDEX"
          />
        </StatusCard>
        <StatusCard
          title="Ring status"
          bgColor={theme.palette.success.light}
          cardColor={theme.palette.primary.main}
        >
          <ReadOnlyPv
            label="Ring Current"
            pv="ca://SR-DI-DCCT-01:SIGNAL"
            parseNumeric
            units="mA"
          />
          <ReadOnlyPv
            label="Ring Energy"
            pv="ca://CS-CS-MSTAT-01:BEAMENERGY"
            parseNumeric
            units="GeV"
          />
        </StatusCard>
      </Stack>
    </Box>
  );
}

function Robot() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<RobotSampleFormData>({
    puck: 1,
    position: 1,
  });
  const theme = useTheme();
  return (
    <Box
      // component={"section"}
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 3,
        mr: 5,
        ml: 5,
      }}
    >
      <Box
        sx={{
          padding: 5,
          borderRadius: 1,
          border: "1px solid",
          borderColor: theme.palette.primary.main,
        }}
      >
        <Stack direction={"column"} spacing={3} alignItems={"center"}>
          <Typography component="h1" variant="h5">
            Sample Position
          </Typography>
          <Stack direction={"row"} spacing={3} alignItems={"center"}>
            <NumberInput
              label="Puck"
              numberMode="natural"
              defaultValue={formData["puck"]}
              onCommit={(parsedValue) => {
                setFormData({ ...formData, ["puck"]: parsedValue });
              }}
            />
            <NumberInput
              label="Position"
              numberMode="natural"
              defaultValue={formData["position"]}
              onCommit={(parsedValue) => {
                setFormData({ ...formData, ["position"]: parsedValue });
              }}
            />
          </Stack>
          <RunPlanButton
            name="robot_load"
            params={formData}
            instrumentSession={instrumentSession}
            buttonText="Load Sample"
          />
          <RunPlanButton
            name="robot_unload"
            instrumentSession={instrumentSession}
            buttonText="Unload Sample"
          />
        </Stack>
      </Box>
      <StatusSidebar />
    </Box>
  );
}

export default Robot;
