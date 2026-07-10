import { Button } from "@mui/material";
import { usePauseQueue } from "../queue/queueService";
import DangerousIcon from "@mui/icons-material/Dangerous";

export function AbortButton() {
  const pause_queue = usePauseQueue();
  const abort = () => {
    pause_queue();
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
