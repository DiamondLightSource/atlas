import {
  Alert,
  Button,
  Snackbar,
  Tooltip,
  type SnackbarCloseReason,
} from "@mui/material";
import React, { useState } from "react";

import {
  useGetWorkerState,
  useSetActiveTask,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { TaskRequest } from "@atlas/blueapi";
import { useUserAuth } from "../context/userAuth/useUserAuth";

type RunPlanButtonProps = {
  name: string;
  params?: object;
  instrumentSession: string;
  buttonText?: string;
};

type SeverityLevel = "success" | "info" | "warning" | "error";

const RunPlanButton = ({
  name,
  params,
  instrumentSession,
  buttonText = "Run",
}: RunPlanButtonProps) => {
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>(`Running ${name} plan`);
  const [severity, setSeverity] = useState<SeverityLevel>("info");

  const [loading, setLoading] = useState<boolean>(false);

  const user = useUserAuth();

  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();

  const submitAndRunTask = async (task: TaskRequest) => {
    await submitTask.mutateAsync(task).then((response) => {
      if (response) {
        startTask.mutateAsync(response.task_id);
      } else {
        throw new Error("Task couldn't be submitted");
      }
    });
  };

  const runOnClick = async () => {
    const taskRequest: TaskRequest = {
      name: name,
      params: params,
      instrument_session: instrumentSession,
    };
    setLoading(true);
    await submitAndRunTask(taskRequest);
    setLoading(false);
  };

  const handleClick = async () => {
    setOpenSnackbar(true);
    await runOnClick().catch((error) => {
      setSeverity("error");
      setMsg(
        `Failed to run plan ${name}, see console and blueapi logs for full error.`,
      );
      console.log(`${msg}. Reason: ${error}`);
    });
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

  const isButtonDisabled = () => {
    const workerState = useGetWorkerState();
    const disable =
      user.person == null ||
      user.person == undefined ||
      workerState.data !== "IDLE";
    return disable;
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        loading={loading}
        sx={{ width: "150px" }}
        onClick={handleClick}
        disabled={isButtonDisabled()}
      >
        {buttonText}
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={severity}>
          {msg}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default RunPlanButton;
