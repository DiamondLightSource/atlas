import { useInstrumentSession } from "@atlas/app-shell";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { RunPlanButton } from "@atlas/blueapi-ui";
import { AbortPlanButton } from "../components/AbortPlanButton";
import { WebcamStreamFromPv } from "../components/Webcam";
import { StatusSummary } from "../components/StatusSummary";

type RobotSampleFormData = {
  puck: number;
  position: number;
};

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
            minValue={1}
            maxValue={20}
            onCommit={(parsedValue) => {
              setFormData({ ...formData, ["puck"]: parsedValue });
            }}
            helperText={false}
          />
          <NumberInput
            label="Position"
            numberMode="natural"
            defaultValue={formData["position"]}
            minValue={1}
            maxValue={22}
            onCommit={(parsedValue) => {
              setFormData({ ...formData, ["position"]: parsedValue });
            }}
            helperText={false}
          />
        </Stack>
        <Stack direction={"row"} spacing={3} alignItems={"center"}>
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
        <AbortPlanButton />
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
        flexDirection: "column",
        justifyContent: "left",
        gap: 2,
      }}
    >
      <StatusSummary />
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
    </Box>
  );
}

export default Robot;
