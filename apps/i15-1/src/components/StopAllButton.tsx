import {
  Alert,
  Button,
  Snackbar,
  type SnackbarCloseReason,
} from "@mui/material";
import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import type { TypedDocumentNode } from "@apollo/client";
import { usePauseQueue } from "../queue/queueService";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import { useBlueapi } from "@atlas/blueapi-query";
import {
  useSubmitAndRunTask,
  type SeverityLevel,
} from "../../../../packages/blueapi-ui/src/useSubmitAndRunTask";
import { useInstrumentSession } from "@atlas/app-shell";
import { getInstrumentSessionsQuery } from "../graphql/getInstrumentSessionsQuery.ts";
import type {
  InstrumentSessionQuery,
  InstrumentSessionQueryVariables,
} from "../graphql/getInstrumentSessionsQuery.generated.ts";

export interface StopAllButtonProps {
  compact?: boolean;
}

const GET_SESSIONS: TypedDocumentNode<
  InstrumentSessionQuery,
  InstrumentSessionQueryVariables
> = getInstrumentSessionsQuery;

export function StopAllButton({ compact }: StopAllButtonProps) {
  const blueapi = useBlueapi();
  const pause_queue = usePauseQueue();
  const { submitAndRunTask } = useSubmitAndRunTask();
  const { instrumentSession } = useInstrumentSession();
  const [fetchSessions] = useLazyQuery(GET_SESSIONS);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");
  const [severity, setSeverity] = useState<SeverityLevel>("info");

  // Use the currently selected session if there is one. Otherwise, any
  // available session will do for the purposes of aborting.
  const getAnySession = async (): Promise<string | null> => {
    if (instrumentSession) {
      return instrumentSession;
    }

    try {
      const { data } = await fetchSessions({
        variables: { instrumentKey: "I15-1" },
      });

      const edges = data?.instrumentByKey?.instrumentSessions?.edges;
      const sessionsList =
        edges?.flatMap((edge) => {
          const ref = edge?.node?.instrumentSessionReference;
          return ref ? [ref.toLocaleLowerCase()] : [];
        }) ?? [];

      return sessionsList[0] ?? null;
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      return null;
    }
  };

  const abort = async () => {
    setOpenSnackbar(true);
    pause_queue();
    blueapi.worker.setState({
      new_state: "ABORTING",
      reason: "Abort button pressed in the UI",
    });

    const session = await getAnySession();
    if (!session) {
      setSeverity("error");
      setMsg(
        "Queue paused and worker set to abort, but couldn't close the fast shutter: no instrument session available.",
      );
      console.log(
        "Failed to close fast shutter.\n No instrument session available.",
      );
      return;
    }

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

  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
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
    </>
  );
}
