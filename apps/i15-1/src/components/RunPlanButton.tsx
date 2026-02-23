import { Button } from "@mui/material";
import { useEffect, useState } from "react";

import { createAndStartTask, type TaskRequest } from "../utils/api";

type RunPlanButtonProps = {
  name: string;
  params: object;
  instrumentSession: string;
  buttonText?: string;
};

const RunPlanButton = ({
  name,
  params,
  instrumentSession,
  buttonText = "Run",
}: RunPlanButtonProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleClick = async () => {
    const taskRequest: TaskRequest = {
      name: name,
      params: params,
      instrument_session: instrumentSession,
    };
    setLoading(true);
    await createAndStartTask(taskRequest);
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
