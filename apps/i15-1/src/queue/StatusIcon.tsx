import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import type { CallStatus } from "../../generated/queue";
import { CHIP_COLOR_MAP, CHIP_SX_MAP } from "./queueConstants";
import { cloneElement } from "react";

const CHIP_ICON_MAP = {
  Success: <CheckCircleIcon />,
  Error: <ErrorIcon />,
  "In progress": <CircularProgress size={10} thickness={4} />,
  Claimed: <CircularProgress size={10} thickness={4} />,
  Waiting: <CircleOutlinedIcon />,
  Skipped: <DoDisturbIcon />,
} satisfies Record<CallStatus, React.ReactNode>;

export function QueueStatusIcon({ status }: { status: CallStatus }) {
  return cloneElement(CHIP_ICON_MAP[status] as React.ReactElement, {
    color: CHIP_COLOR_MAP[status],
    sx: CHIP_SX_MAP[status],
  });
}
