import { Button } from "@mui/material";
import { usePauseQueue } from "../queue/queueService";
import DangerousIcon from "@mui/icons-material/Dangerous";
import { useBlueapi } from "@atlas/blueapi-query";

export function AbortButton() {
  const blueapi = useBlueapi();
  const pause_queue = usePauseQueue();

  const abort = () => {
    pause_queue();
    blueapi.worker.setState({
      new_state: "ABORTING",
      reason: "Abort button pressed in the UI",
    });
  };

  return (
    <Button
      sx={{
        height: 40,
        width: 150,
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
      startIcon={<DangerousIcon />}
    >
      ABORT
    </Button>
  );
}
