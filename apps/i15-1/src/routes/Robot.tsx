import { useInstrumentSession } from "../context/instrumentSession/useInstrumentSession";
import { Box, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { NumberInput } from "../components/NumberInput";
import RunPlanButton from "../components/RunPlanButton";

type RobotSampleFormData = {
  puck: number;
  position: number;
};

function Robot() {
  const { instrumentSession, setInstrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<RobotSampleFormData>({
    puck: 1,
    position: 1,
  });
  return (
    <>
      <Box display={"flex"} justifyContent={"center"} sx={{ mt: 3 }}>
        <Stack direction={"column"} spacing={3} alignItems={"center"}>
          <Typography component="h1" variant="h5">
            Sample Position
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
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
          </Box>
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
    </>
  );
}

export default Robot;
