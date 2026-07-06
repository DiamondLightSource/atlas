import { Box, Collapse, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { cloneElement, useState } from "react";
import type {
  BlueapiCallResponse,
  CallStatus,
  TaskRequest,
} from "../../generated/queue/types.gen";
import { CHIP_COLOR_MAP, CHIP_SX_MAP, CHIP_ICON_MAP } from "./queueConstants";
import { JsonView } from "../components/JsonView";

function PlanStatusRow({
  status,
  task_request,
}: {
  status: CallStatus;
  task_request: TaskRequest;
}) {
  const icon = cloneElement(CHIP_ICON_MAP[status] as React.ReactElement, {
    color: CHIP_COLOR_MAP[status],
    sx: CHIP_SX_MAP[status],
  });
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ paddingLeft: 6 }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 0.4,
        }}
      >
        <ExpandMoreIcon
          sx={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "0.2s",
            color: "action.active",
          }}
        />
        {icon}
        <Typography>{task_request.name}</Typography>
      </Box>

      <Collapse in={open}>
        <JsonView data={task_request} />
      </Collapse>
    </Box>
  );
}

export function PlanStatusPanel({ data }: { data: BlueapiCallResponse[] }) {
  return (
    <Box>
      {data.map((call, i) => (
        <PlanStatusRow
          key={`${call.task_request.name}-${i}`}
          status={call.status}
          task_request={call.task_request}
        />
      ))}
    </Box>
  );
}
