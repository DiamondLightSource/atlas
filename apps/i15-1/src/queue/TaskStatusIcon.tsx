import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import type {
  BlueapiCallResponse,
  CallStatus,
  Status,
} from "../../generated/queue";
import { CHIP_COLOR_MAP } from "./queueConstants";
import { cloneElement } from "react";
import { Tooltip, type SxProps, type Theme } from "@mui/material";

const CHIP_ICON_MAP = {
  Success: <CheckCircleIcon />,
  Error: <ErrorIcon />,
  "In progress": <CircularProgress size={20} thickness={5} />,
  Claimed: <CircularProgress size={20} thickness={4} />,
  Waiting: <CircleOutlinedIcon />,
  Skipped: <DoDisturbIcon />,
} satisfies Record<CallStatus, React.ReactNode>;

const CHIP_SX_MAP: Partial<Record<Status | CallStatus, SxProps<Theme>>> = {
  Waiting: {
    color: "grey.500",
    borderColor: "grey.300",
  },
  Skipped: {
    color: "grey.500",
    borderColor: "grey.300",
  },
};

export function TaskStatusIcon({
  blueapi_call,
}: {
  blueapi_call: BlueapiCallResponse;
}) {
  const hover_info = blueapi_call.errors.length
    ? blueapi_call.errors
        .map((error) => (typeof error === "string" ? error : error.message))
        .join(",\n")
    : blueapi_call.result?.result != null
      ? String(blueapi_call.result.result)
      : blueapi_call.status;
  return (
    <Tooltip title={hover_info}>
      {cloneElement(CHIP_ICON_MAP[blueapi_call.status] as React.ReactElement, {
        color: CHIP_COLOR_MAP[blueapi_call.status],
        sx: CHIP_SX_MAP[blueapi_call.status],
      })}
    </Tooltip>
  );
}
