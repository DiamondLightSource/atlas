import {
  Alert,
  Button,
  Snackbar,
  type SnackbarCloseReason,
} from "@mui/material";
import React, { useState } from "react";

import {
  useBlueapi,
  useGetWorkerState,
  useSetActiveTask,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { TaskRequest, TaskResponse } from "@atlas/blueapi";

export type RunPlanButtonProps = {
  name: string;
  params?: object;
  instrumentSession: string;
  buttonText?: string;
};

type SeverityLevel = "success" | "info" | "warning" | "error";

const idleState = "IDLE";
const abortState = "ABORTING";

export function RunPlanButton({
  name,
  params,
  instrumentSession,
  buttonText = "Run",
}: RunPlanButtonProps) {
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>(`Running ${name} plan`);
  const [severity, setSeverity] = useState<SeverityLevel>("info");

  const [loading, setLoading] = useState<boolean>(false);

  const blueapi = useBlueapi();

  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();

  const waitForIdle = async (timeoutInMs: number): Promise<void> => {
    return new Promise((res) => setTimeout(res, timeoutInMs));
  };

  const runTask = async (task_id: string) => {
    await startTask.mutateAsync(task_id).then(async (response) => {
      if (response) {
        console.log("Running plan");
        let status = await blueapi.worker.getState();
        while (status !== idleState && status !== abortState) {
          console.log(`status: ${status}`);
          await waitForIdle(100);
          status = await blueapi.worker.getState();
        }
        const data = await blueapi.tasks.get(task_id);
        console.log(data);
        if (data.is_complete) {
          if (data.outcome?.outcome === "success") {
            setSeverity("success");
            setMsg("Plan succeeded");
          } else if (data.outcome?.outcome === "error") {
            throw new Error(`${data.errors[0]}`);
          }
        }
      }
    });
  };

  const submitAndRunTask = async (
    task: TaskRequest,
  ): Promise<TaskResponse | void> => {
    await submitTask.mutateAsync(task).then(async (response) => {
      if (response) {
        console.log("Plan successfully submitted");
        setSeverity("info");
        setMsg("Plan submission successful!");
        await runTask(response.task_id).catch((error) => {
          throw new Error(error);
        });
      } else {
        setSeverity("error");
        setMsg("Plan submission failed!");
        throw new Error("Task couldn't be submitted");
      }
    });
  };

  const handleClick = async () => {
    setOpenSnackbar(true);
    setLoading(true);
    const taskRequest: TaskRequest = {
      name: name,
      params: params,
      instrument_session: instrumentSession,
    };
    await submitAndRunTask(taskRequest).catch((error) => {
      setSeverity("error");
      setMsg(
        `Failed to run plan ${name}, see console and blueapi logs for full error.`,
      );
      console.log(`${msg}.\n Reason: ${error}`);
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
    const disable = workerState.data !== idleState;

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
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={severity}>
          {msg}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
