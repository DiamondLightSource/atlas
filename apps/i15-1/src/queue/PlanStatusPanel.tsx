import { Box, Collapse, Link, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import type { BlueapiCallResponse } from "../../generated/queue/types.gen";
import { JsonView } from "../components/JsonView";
import { TaskStatusIcon } from "./TaskStatusIcon";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const TILED_BASE_URL = "https://tiled-ui.diamond.ac.uk/ui/browse/";

interface TiledLinksRowProps {
  tiled_ids: (string | null)[];
  run_numbers: (string | number)[];
}

function TiledLinks({ tiled_ids, run_numbers }: TiledLinksRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {tiled_ids.map((tiled_id, index) =>
        tiled_id != null ? (
          <Tooltip title="Open collection in tiled" key={index}>
            <Link
              href={`${TILED_BASE_URL}${tiled_id}`}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.3,
              }}
            >
              {run_numbers[index]}
              <OpenInNewIcon sx={{ fontSize: 14 }} />
            </Link>
          </Tooltip>
        ) : (
          <Typography variant="body2" key={index}>
            {run_numbers[index]}
          </Typography>
        ),
      )}
    </Box>
  );
}

function PlanStatusRow({
  blueapi_call,
}: {
  blueapi_call: BlueapiCallResponse;
}) {
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
        <TaskStatusIcon status={blueapi_call.status} />
        <Typography>{blueapi_call.task_request.name}</Typography>

        <TiledLinks
          tiled_ids={blueapi_call.tiled_ids}
          run_numbers={blueapi_call.scan_ids}
        />
      </Box>

      <Collapse in={open} unmountOnExit>
        <JsonView data={blueapi_call.task_request} />
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
          blueapi_call={call}
        />
      ))}
    </Box>
  );
}
