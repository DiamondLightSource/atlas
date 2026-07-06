import type { ChipProps, SxProps, Theme } from "@mui/material";
import type { Status, CallStatus } from "../../generated/queue";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export const CHIP_COLOR_MAP = {
  Queued: "primary",
  Waiting: "primary",
  "In progress": "info",
  Claimed: "info",
  Complete: "success",
  Success: "success",
  Cancelled: "warning",
  Error: "error",
  Skipped: "primary",
} satisfies Record<Status | CallStatus, ChipProps["color"]>;

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

export const CHIP_ICON_MAP = {
  Success: <CheckCircleIcon />,
  Error: <ErrorIcon />,
  "In progress": <CircularProgress size={10} thickness={4} />,
  Claimed: <CircularProgress size={20} thickness={6} />,
  Waiting: <CircleOutlinedIcon />,
  Skipped: <DoDisturbIcon />,
} satisfies Record<CallStatus, React.ReactNode>;
