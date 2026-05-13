import {
  Alert,
  Button,
  Snackbar,
  Tooltip,
  type SnackbarCloseReason,
} from "@mui/material";

import type { WorkerStateRequest } from "@atlas/blueapi";
import { useSetWorkerState } from "@atlas/blueapi-query";
import React, { useState } from "react";

export function AbortPlanButton() {
  const workerState = useSetWorkerState();
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const abortPlan = async () => {
    const workerRequest: WorkerStateRequest = {
      new_state: "ABORTING",
      reason: "Abort button pressed",
    };
    workerState.mutate(workerRequest);
  };

  const handleClick = async () => {
    setOpenSnackbar(true);
    await abortPlan();
  };

  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <React.Fragment>
      <Tooltip title="Abort current blueapi operation" placement="bottom">
        <Button
          variant="contained"
          color="error"
          sx={{ width: "150px" }}
          onClick={handleClick}
        >
          Abort
        </Button>
      </Tooltip>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleSnackbarClose} severity="warning">
          Abort button pressed, will abort current plan ...
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
