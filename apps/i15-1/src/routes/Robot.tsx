import { useInstrumentSession } from "../context/instrumentSession/useInstrumentSession";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import { NumberInput } from "../components/NumberInput";
import { RunPlanButton } from "@atlas/blueapi-ui";
import { ReadOnlyPv } from "@atlas/pvws-config";
import { StatusCard } from "../components/StatusCard";
// import { AbortPlanButton } from "../components/AbortPlanButton";
import { WebcamStreamFromPv } from "../components/Webcam";

type RobotSampleFormData = {
  puck: number;
  position: number;
};

function StatusSidebar() {
  const theme = useTheme();
  return (
    <Box sx={{ ml: 5 }}>
      <Stack direction={"row"} spacing={2}>
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
        <StatusCard
          title="EH3 Safety"
          bgColor={theme.palette.success.light}
          cardColor={theme.palette.primary.main}
        >
          <ReadOnlyPv label="Hutch Enabled" pv="ca://BL15I-PS-IOC-02:M14:LOP" />
        </StatusCard>
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
      </Stack>
    </Box>
  );
}

function RobotControl() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<RobotSampleFormData>({
    puck: 1,
    position: 1,
  });
  const theme = useTheme();
  return (
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
          Robot Control
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
  );
}

// TODO: Webcams currently not visible unless streams are not automatically
// upgraded to https (and not available outside the beamline network). Stream
// serving needs to be updated when available.
// https://github.com/DiamondLightSource/atlas/issues/90
function Robot() {
  return (
    <Box
      // component={"section"}
      sx={{
        display: "flex",
        justifyContent: "left",
        mt: 3,
        mr: 5,
        ml: 5,
      }}
    >
      <Stack direction={"column"} spacing={3} alignItems={"left"}>
        <StatusSidebar />
        <Stack direction={"row"} spacing={3} alignItems={"left"}>
          <WebcamStreamFromPv
            label="JWEB1"
            sourcePv="ca://BL15J-DI-WEB-01:MJPG:MJPG_URL_RBV"
            size="250"
          />
          <WebcamStreamFromPv
            label="JCAM2"
            sourcePv="ca://BL15J-DI-CAM-02:MJPG:MJPG_URL_RBV"
            size="250"
          />
          <RobotControl />
        </Stack>
      </Stack>
    </Box>
  );
}

export default Robot;
