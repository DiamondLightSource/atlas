import { Tooltip } from "@mui/material";
import type { WorkflowStatus } from "../../utils/types";
import {
  CircleAlert,
  CircleCheckBig,
  CircleEllipsis,
  CircleQuestionMark,
  LoaderCircle,
} from "lucide-react";

export const getWorkflowStatusIcon = (
  status: WorkflowStatus,
  size: number = 25,
) => {
  const workflowStatusIconMap: { [key in WorkflowStatus]: React.JSX.Element } =
    {
      Unknown: (
        <Tooltip title="Unknown" data-testid="status-icon-unknown">
          <CircleQuestionMark size={size} color="warning" />
        </Tooltip>
      ),
      WorkflowPendingStatus: (
        <Tooltip title="Pending" data-testid="status-icon-pending">
          <CircleEllipsis size={size} color="warning" />
        </Tooltip>
      ),
      WorkflowRunningStatus: (
        <Tooltip title="Running" data-testid="status-icon-running">
          <LoaderCircle size={size} color="info" />
        </Tooltip>
      ),
      WorkflowSucceededStatus: (
        <Tooltip title="Succeeded" data-testid="status-icon-succeeded">
          <CircleCheckBig size={size} color="success" />
        </Tooltip>
      ),
      WorkflowFailedStatus: (
        <Tooltip title="Failed" data-testid="status-icon-failed">
          <CircleAlert size={size} color="error" />
        </Tooltip>
      ),
      WorkflowErroredStatus: (
        <Tooltip title="Errored" data-testid="status-icon-errored">
          <CircleAlert size={size} color="error" />
        </Tooltip>
      ),
    };

  return workflowStatusIconMap[status];
};
