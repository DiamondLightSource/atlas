import { Button } from "@mui/material";
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
  const handleClick = async () => {
    const taskRequest: TaskRequest = {
      name: name,
      params: params,
      instrument_session: instrumentSession,
    };
    setLoading(true);
    await submitAndRunTask(taskRequest);
    setLoading(false);
  };

  const isButtonDisabled = () => {
    const workerState = useGetWorkerState();
    const disable = workerState.data !== "IDLE";
    return disable;
  };

  return (
    <Button
      variant="contained"
      loading={loading}
      sx={{ width: "150px" }}
      onClick={handleClick}
      disabled={isButtonDisabled()}
    >
      {buttonText}
    </Button>
  );
}
