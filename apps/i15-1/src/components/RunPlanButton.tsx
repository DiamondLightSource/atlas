import { Button } from "@mui/material";
import { useState } from "react";

import { useSetActiveTask, useSubmitTask } from "@atlas/blueapi-query";
import type { TaskRequest } from "@atlas/blueapi";

type RunPlanButtonProps = {
  name: string;
  params?: object;
  instrumentSession: string;
  buttonText?: string;
};

const RunPlanButton = ({
  name,
  params,
  instrumentSession,
  buttonText = "Run",
}: RunPlanButtonProps) => {
  
  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();
  const submitAndRunTask = async (task: TaskRequest) => {
    await submitTask
      .mutateAsync(task)
      .then(response => startTask.mutateAsync(response.task_id));
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

  return (
    <Button
      variant="contained"
      loading={loading}
      sx={{ width: "150px" }}
      onClick={handleClick}
    >
      {buttonText}
    </Button>
  );
};

export default RunPlanButton;
