import {
  Alert,
  Button,
  Snackbar,
  type SnackbarCloseReason,
} from "@mui/material";
import { useState } from "react";
import { usePauseQueue } from "../queue/queueService";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import { useBlueapi } from "@atlas/blueapi-query";
import {
  useSubmitAndRunTask,
  type SeverityLevel,
  FeedbackSnackbar,
} from "@atlas/blueapi-ui";
import { useInstrumentSession } from "@atlas/app-shell";

export interface StopAllButtonProps {
  compact?: boolean;
}

export function StopAllButton({ compact }: StopAllButtonProps) {
  const blueapi = useBlueapi();
  const pause_queue = usePauseQueue();
  const { submitAndRunTask } = useSubmitAndRunTask();
  const { instrumentSession } = useInstrumentSession();

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");
  const [severity, setSeverity] = useState<SeverityLevel>("info");

  // Use the currently selected session if there is one. Otherwise, a default
  // session should work for now (see https://github.com/DiamondLightSource/blueapi/issues/1616#issuecomment-5778972411)
  const getAnySession = async (): Promise<string> => {
    if (instrumentSession) {
      return instrumentSession;
    }

    return "cm11111-1";
  };

  const abort = async () => {
    setOpenSnackbar(true);
    pause_queue();
    blueapi.worker.setState({
      new_state: "ABORTING",
      reason: "Abort button pressed in the UI",
    });

    const session = await getAnySession();
    try {
      const result = await submitAndRunTask(
        {
          name: "move",
          instrument_session: session,
          params: { moves: { fast_shutter: "Close" } },
        },
        (interim) => {
          setSeverity(interim.severity);
          setMsg(interim.message);
        },
      );
      setSeverity(result.severity);
      setMsg(result.message);
    } catch (error) {
      setSeverity("error");
      setMsg("Failed to abort, see console and blueapi logs for full error.");
      console.log(`Failed to abort.\n Reason: ${error}`);
    }
  };

  return (
    <>
      <Button
        sx={{
          height: 40,
          width: "100%",
          gap: 1,
          fontSize: 16,
          fontWeight: "bold",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          "& .MuiButton-startIcon": {
            display: "flex",
            alignItems: "center",
          },
        }}
        variant="contained"
        color="error"
        onClick={abort}
      >
        <DangerousOutlinedIcon /> {compact ? "" : "STOP ALL"}
      </Button>
      <FeedbackSnackbar
        open={openSnackbar}
        setOpen={setOpenSnackbar}
        message={msg}
        severity={severity}
      />
    </>
  );
}
