import { useGetWorkerState } from "@atlas/blueapi-query";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
  type Theme,
} from "@mui/material";

function getStateColorMap(theme: Theme) {
  return {
    IDLE: theme.palette.info.main,
    RUNNING: theme.palette.success.main,
    PAUSING: theme.palette.warning.main,
    PAUSED: theme.palette.warning.main,
    HALTING: theme.palette.warning.main,
    STOPPING: theme.palette.error.main,
    ABORTING: theme.palette.error.main,
    SUSPENDING: theme.palette.error.main,
    PANICKED: theme.palette.error.main,
    UNKNOWN: theme.palette.background.paper,
  };
}

export function BlueapiWorkerState() {
  const theme = useTheme();
  const workerState = useGetWorkerState();
  const stateMap = getStateColorMap(theme);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 250,
        maxHeight: 100,
        bgcolor: theme.palette.background.paper,
        borderColor: theme.palette.text.primary,
      }}
    >
      <CardContent>
        <Stack direction={"column"} spacing={"1"}>
          <Typography>Blueapi worker state: </Typography>
          <Typography
            variant="body1"
            color={stateMap[workerState.data ? workerState.data : "UNKNOWN"]}
          >
            {workerState.data}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
