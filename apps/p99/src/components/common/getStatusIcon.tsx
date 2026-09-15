import type React from "react";
import {
  CircleAlert,
  CircleCheckBig,
  CircleEllipsis,
  CircleQuestionMark,
  LoaderCircle,
} from "lucide-react";
import { Tooltip } from "@mui/material";
import type { Status } from "../../utils/types";

export const getStatusIcon = (status: Status, size: number = 20) => {
  const statusIcon: { [key in Status]: React.JSX.Element } = {
    unknown: (
      <Tooltip title="Unknown" data-testid="status-icon-unknown">
        <CircleQuestionMark size={size} color="#FF6600" />
      </Tooltip>
    ),
    pending: (
      <Tooltip title="Pending" data-testid="status-icon-pending">
        <CircleEllipsis size={size} color="#FF6600" />
      </Tooltip>
    ),
    running: (
      <Tooltip title="Running" data-testid="status-icon-running">
        <LoaderCircle size={size} color="#204a87" />
      </Tooltip>
    ),
    complete: (
      <Tooltip title="Complete" data-testid="status-icon-complete">
        <CircleCheckBig size={size} color="#4e9a06" />
      </Tooltip>
    ),
    error: (
      <Tooltip title="Error" data-testid="status-icon-error">
        <CircleAlert size={size} color="#a40000" />
      </Tooltip>
    ),
  };

  return statusIcon[status];
};
