import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import {
  useConnected,
  useGetQueuedTasks,
  useToggleQueueState,
} from "./queueService";

export function QueueControlButton() {
  const { paused, toggle, isLoading } = useToggleQueueState();
  const { connected } = useConnected();

  const icon = isLoading ? (
    <CircularProgress size={16} />
  ) : paused ? (
    <PlayArrowIcon fontSize="small" />
  ) : (
    <PauseIcon fontSize="small" />
  );

  return (
    <Button
      sx={{
        height: 28,
        width: 100,
        alignItems: "center",
        "& .MuiButton-startIcon": {
          display: "flex",
          alignItems: "center",
        },
      }}
      variant="contained"
      color={!connected ? "error" : paused ? "warning" : "success"}
      onClick={toggle}
      disabled={!connected}
      startIcon={icon}
    >
      {paused ? "Resume" : "Pause"}
    </Button>
  );
}

export function QueueStatusPanel() {
  const { paused } = useToggleQueueState();
  const queuedTasks = useGetQueuedTasks();
  const empty = !queuedTasks.data || queuedTasks.data.length === 0;
  const { connected } = useConnected();

  return (
    <Box
      sx={{
        display: "flex",
        border: "1px solid",
        borderColor: !connected
          ? "error.main"
          : paused
            ? "warning.main"
            : "success.main",
        borderRadius: 1,
        padding: 1,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography
          variant="h6"
          sx={{
            color: !connected
              ? "error.main"
              : paused
                ? "warning.main"
                : "success.main",
            fontWeight: 500,
            fontSize: 17,
          }}
        >
          Queue{" "}
          {!connected
            ? "Not Connected"
            : empty
              ? "Finished"
              : paused
                ? "Paused"
                : "Running"}
        </Typography>
        <QueueControlButton />
      </Stack>
    </Box>
  );
}
