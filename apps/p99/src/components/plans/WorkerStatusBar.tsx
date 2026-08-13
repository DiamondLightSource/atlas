import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import LoopIcon from "@mui/icons-material/Loop";

import type { WorkerState } from "@atlas/blueapi";
import { getStatusColor } from "./utils";

interface WorkerStatusBarProps {
  workerState: WorkerState;
  activeTaskId: string | null;
  isFetching: boolean;
  onSync: () => void;
  instrumentSession: string;
  onInstrumentSessionChange: (session: string) => void;
}

export function WorkerStatusBar({
  workerState,
  activeTaskId,
  isFetching,
  onSync,
  instrumentSession,
  onInstrumentSessionChange,
}: WorkerStatusBarProps) {
  const statusStyle = getStatusColor(workerState);
  return (
    <Paper
      elevation={2}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        borderRadius: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 1.5,
        px: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            P99 Control
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Beamline Plan Library
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            label="Session ID"
            size="small"
            value={instrumentSession}
            onChange={(e) => onInstrumentSessionChange(e.target.value)}
            sx={{ minWidth: 180, bgcolor: "background.paper" }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box
            sx={{
              bgcolor: statusStyle.bg,
              color: statusStyle.text,
              border: "1px solid",
              borderColor: statusStyle.border,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontWeight: "bold",
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {workerState === "RUNNING" && (
              <CircularProgress size={16} color="inherit" />
            )}
            STATE: {workerState}
            {activeTaskId && (
              <Typography
                variant="caption"
                sx={{ opacity: 0.8, ml: 1, borderLeft: "1px solid", pl: 1 }}
              >
                ID: {activeTaskId.substring(0, 8)}...
              </Typography>
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<LoopIcon />}
            onClick={onSync}
            disabled={isFetching}
          >
            Sync
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
