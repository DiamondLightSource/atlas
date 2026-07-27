import { Button } from "@mui/material";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";
import { useState } from "react";

import {
  useGetWorkerState,
  useSetActiveTask,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { TaskRequest } from "@atlas/blueapi";

export type RunPlanButtonProps = {
  name: string;
  params?: object;
  instrumentSession: string;
  buttonText?: string;
};

export function RunPlanButton({
  name,
  params,
  instrumentSession,
  buttonText = "Run",
}: RunPlanButtonProps) {
  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();
  const submitAndRunTask = async (task: TaskRequest) => {
    await submitTask
      .mutateAsync(task)
      .then((response) => startTask.mutateAsync(response.task_id));
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [planSubmitted, setPlanSubmitted] = useState<boolean>(false);
  const [planSubmissionResult, setPlanSubmissionResult] = useState<
    boolean | null
  >(null);
  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setPlanSubmitted(false);
    setPlanSubmissionResult(null);
  };

  const handleClick = async () => {
    const taskRequest: TaskRequest = {
      name: name,
      params: params,
      instrument_session: instrumentSession,
    };
    setLoading(true);
    try {
      await submitAndRunTask(taskRequest);
      setPlanSubmissionResult(true);
      setPlanSubmitted(true);
    } catch (error) {
      setPlanSubmissionResult(false);
      setPlanSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const snackbarMessage = planSubmissionResult
    ? "Plan submission successful!"
    : planSubmissionResult === false
      ? "Plan submission failed!"
      : "Plan submission state unknown!";

  const isButtonDisabled = () => {
    const workerState = useGetWorkerState();
    const disable = workerState.data !== "IDLE";
    return disable;
  };

  return (
    <div>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={planSubmitted}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
}
