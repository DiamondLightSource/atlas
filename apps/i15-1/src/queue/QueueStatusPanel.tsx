import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import {
  useConnected,
  useGetQueuedTasks,
  useSyncQueue,
  useToggleQueueState,
} from "./queueService";
import RefreshIcon from "@mui/icons-material/Refresh";
export function QueueControlButton() {
  const { queueState, toggle, isLoading } = useToggleQueueState();
  const { connected } = useConnected();

  const icon = isLoading ? (
    <CircularProgress size={16} />
  ) : queueState?.paused ? (
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
      color={!connected ? "error" : queueState?.paused ? "warning" : "success"}
      onClick={toggle}
      disabled={!connected}
      startIcon={icon}
    >
      {queueState?.paused ? "Resume" : "Pause"}
    </Button>
  );
}

const syncQueueTooltip = (
  <>
    <strong>Sync queue</strong>
    <br />
    Syncing happens automatically whenever the queue changes, but you may want
    to do this manually if something external has changed, like a config file,
    to see the result immediately. The queue always syncs before running each
    task, so this button won't change what runs, only how soon you see the
    update here.
  </>
);

export function SyncQueueButton() {
  const { connected } = useConnected();
  const { mutate, isPending } = useSyncQueue();

  return (
    <Tooltip title={syncQueueTooltip}>
      {/* span wrapper so the tooltip still works when the button is disabled */}
      <span>
        <IconButton
          size="small"
          onClick={() => mutate()}
          disabled={!connected || isPending}
          aria-label="sync queue"
          color="secondary"
          sx={{
            width: 28,
            height: 28,
            border: "1px solid",
            borderColor: "secondary",
            borderRadius: 1,
          }}
        >
          {isPending ? (
            <CircularProgress
              size={20}
              color="secondary"
              sx={{ display: "block" }}
            />
          ) : (
            <RefreshIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function QueueStatusPanel() {
  const { queueState } = useToggleQueueState();
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
          : queueState?.paused
            ? "warning.main"
            : "success.main",
        borderRadius: 1,
        padding: 1,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography
          variant="h6"
          sx={{
            color: !connected
              ? "error.main"
              : queueState?.paused
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
              : queueState?.paused
                ? "Paused"
                : "Running"}
        </Typography>
        <QueueControlButton />
        <SyncQueueButton />
      </Stack>
    </Box>
  );
}
