import { Button, type ButtonProps } from "@mui/material";
import { useEffect, useState } from "react";

import { useScanEvents } from "../hooks/scanEvents";
import type { WorkerStateRequest } from "@atlas/blueapi";
import { useSetWorkerState } from "@atlas/blueapi-query";

const AbortButton = ({ size }: { size?: ButtonProps["size"] }) => {
  const [disabled, setDisabled] = useState<boolean>(true);
  const scanEvent = useScanEvents();
  const workerState = useSetWorkerState();
  useEffect(() => {
    if (!scanEvent) return;
    if (scanEvent.status == "running") {
      setDisabled(false);
    }
    if (scanEvent.status == "finished" || scanEvent.status == "failed") {
      setDisabled(true);
    }
  }, [scanEvent]);
  return (
    <Button
      variant="contained"
      color="error"
      size={size}
      disabled={disabled}
      onClick={async () => {
        const workerRequest: WorkerStateRequest = {
          new_state: "ABORTING",
          reason: "UI Intervention",
        };
        workerState.mutate(workerRequest);
      }}
    >
      Abort
    </Button>
  );
};

export default AbortButton;
