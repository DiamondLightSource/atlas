import type { ChipProps } from "@mui/material";
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
