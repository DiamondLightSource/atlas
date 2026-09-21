import { Alert, Snackbar, type SnackbarCloseReason } from "@mui/material";
import React from "react";

export type SeverityLevel = "success" | "info" | "warning" | "error";

type FeedbackSnackbarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  severity: SeverityLevel;
  timeout?: number;
};

export function FeedbackSnackbar(props: FeedbackSnackbarProps): JSX.Element {
  const getOpenDuration = (severity: SeverityLevel) => {
    if (severity === "error") {
      return 10000;
    } else {
      return 1000;
    }
  };
  const timeout = props.timeout
    ? props.timeout
    : getOpenDuration(props.severity);

  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    props.setOpen(false);
  };
  return (
    <React.Fragment>
      <Snackbar
        open={props.open}
        autoHideDuration={timeout}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={props.severity}>
          {props.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
