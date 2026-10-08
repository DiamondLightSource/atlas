import { Button } from "@mui/material";
import React, { useState } from "react";

import { useGetWorkerState } from "@atlas/blueapi-query";
import type { TaskRequest } from "@atlas/blueapi";

import { useSubmitAndRunTask } from "./useSubmitAndRunTask";
import { FeedbackSnackbar, type SeverityLevel } from "./utils/FeedbackSnackbar";

export type RunPlanButtonProps = {
  name: string;
  params?: object;
  instrumentSession: string | null;
  buttonText?: string;
};

const idleState = "IDLE";

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

  const { submitAndRunTask } = useSubmitAndRunTask();

  const handleClick = async () => {
    setOpenSnackbar(true);
    setLoading(true);
    if (instrumentSession) {
      const taskRequest: TaskRequest = {
        name,
        params,
        instrument_session: instrumentSession,
      };
      try {
        const result = await submitAndRunTask(taskRequest, (interim) => {
          setSeverity(interim.severity);
          setMsg(interim.message);
        });
        setSeverity(result.severity);
        setMsg(result.message);
      } catch (error) {
        setSeverity("error");
        setMsg(
          `Failed to run plan ${name}, see console and blueapi logs for full error.`,
        );
        console.log(`Failed to run plan ${name}.\n Reason: ${error}`);
      } finally {
        setLoading(false);
      }
    } else {
      setSeverity("error");
      setMsg(`Failed to run plan ${name}, no instrument session was set.`);
      console.log(
        `Failed to run plan ${name}.\n No instrument session was set.`,
      );
      setLoading(false);
    }
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
      <FeedbackSnackbar
        open={openSnackbar}
        setOpen={setOpenSnackbar}
        message={msg}
        severity={severity}
      />
    </React.Fragment>
  );
}
