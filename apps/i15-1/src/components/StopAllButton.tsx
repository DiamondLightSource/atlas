import { Button } from "@mui/material";
import { usePauseQueue } from "../queue/queueService";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import { useBlueapi } from "@atlas/blueapi-query";

export interface StopAllButtonProps {
  compact?: boolean;
}

export function StopAllButton({ compact }: StopAllButtonProps) {
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
  );
}
