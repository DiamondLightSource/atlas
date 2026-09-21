import { Button, Tooltip } from "@mui/material";

import type { WorkerStateRequest } from "@atlas/blueapi";
import { useSetWorkerState } from "@atlas/blueapi-query";
import React, { useState } from "react";
import { FeedbackSnackbar } from "@atlas/blueapi-ui";

export function AbortPlanButton() {
  const workerState = useSetWorkerState();
  const abortMsg = "Abort button pressed, will abort current plan ...";
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
      <FeedbackSnackbar
        open={openSnackbar}
        setOpen={setOpenSnackbar}
        message={abortMsg}
        severity="warning"
        timeout={5000}
      />
    </React.Fragment>
  );
}
