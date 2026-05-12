import { Button, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

import type { WorkerStateRequest } from "@atlas/blueapi";
import { useSetWorkerState } from "@atlas/blueapi-query";

export function AbortPlanButton() {
  const theme = useTheme();
  const workerState = useSetWorkerState();

  const handleClick = async () => {
    const workerRequest: WorkerStateRequest = {
      new_state: "ABORTING",
      reason: "Abort button pressed",
    };
    workerState.mutate(workerRequest);
  };
  return (
    <Button
      variant="contained"
      color="error"
      sx={{ width: "150px" }}
      onClick={handleClick}
    >
      Abort
    </Button>
  );
}
