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
  useTask,
} from "@atlas/blueapi-query";
import type { TaskRequest, TaskResponse } from "@atlas/blueapi";
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

  const submitAndRunTask = async (
    task: TaskRequest,
  ): Promise<TaskResponse | void> => {
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
    await submitAndRunTask(taskRequest).then((response) => {
      if (response) {
        const { data } = useTask(response.task_id);
        if (data?.is_complete && data.outcome?.outcome === "success") {
          setSeverity("success");
          setMsg("Plan succeeded");
        } else {
          setSeverity("error");
          setMsg(`Plan failed with error ${data?.errors[0]}`); // typing to use data.outcome.message needs fixing
        }
      }
    });
  };

  const handleClick = async () => {
    setOpenSnackbar(true);
    setLoading(true);
    await runOnClick().catch((error) => {
      setSeverity("error");
      setMsg(
        `Failed to run plan ${name}, see console and blueapi logs for full error.`,
      );
      console.log(`${msg}. Reason: ${error}`);
    });
    setLoading(false);
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
