import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import type { CallStatus, Status } from "../../generated/queue";
import { CHIP_COLOR_MAP } from "./queueConstants";
import { cloneElement } from "react";
import type { SxProps, Theme } from "@mui/material";

const CHIP_ICON_MAP = {
  Success: <CheckCircleIcon />,
  Error: <ErrorIcon />,
  "In progress": <CircularProgress size={10} thickness={4} />,
  Claimed: <CircularProgress size={10} thickness={4} />,
  Waiting: <CircleOutlinedIcon />,
  Skipped: <DoDisturbIcon />,
} satisfies Record<CallStatus, React.ReactNode>;

export const CHIP_SX_MAP: Partial<Record<Status | CallStatus, SxProps<Theme>>> =
  {
    Waiting: {
      color: "grey.500",
      borderColor: "grey.300",
    },
    Skipped: {
      color: "grey.500",
      borderColor: "grey.300",
    },
  };

export function TaskStatusIcon({ status }: { status: CallStatus }) {
  return cloneElement(CHIP_ICON_MAP[status] as React.ReactElement, {
    color: CHIP_COLOR_MAP[status],
    sx: CHIP_SX_MAP[status],
  });
}
