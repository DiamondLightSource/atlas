import type { ChipProps, SxProps, Theme } from "@mui/material";
import type { Status, CallStatus } from "../../generated/queue";

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
