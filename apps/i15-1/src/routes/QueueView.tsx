import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  type ChipProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { cloneElement, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  cancelTasks,
  clearHistory,
  useGetAllTasks,
  useGetHistoricTasks,
  useGetQueuedTasks,
  useMoveTask,
  useQueueEvents,
} from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import { QueueStatusPanel } from "../queue/QueueStatusPanel";
import { calculateNewPosition, getTableData } from "../queue/queueUtils";
import type {
  BlueapiCallResponse,
  CallStatus,
  Status,
  TaskWithPosition,
} from "../../generated/queue";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const CHIP_COLOR_MAP = {
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

export const CHIP_ICON_MAP = {
  Success: <CheckCircleIcon />,
  Error: <ErrorIcon />,
  "In progress": <CircularProgress size={10} thickness={4} />,
  Claimed: <CircularProgress size={20} thickness={6} />,
  Waiting: <CircleOutlinedIcon />,
  Skipped: <DoDisturbIcon />,
} satisfies Record<CallStatus, React.ReactNode>;

function PlanStatusPanel({ data }: { data: BlueapiCallResponse[] }) {
  const tableData = useMemo(
    () =>
      data.map((call) => ({
        status: call.status,
        task_request: call.task_request,
      })),
    [data],
  );

  return (
    <Box>
      {tableData.map((row, i) => {
        const status = row.status;
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
              <Typography>{row.task_request.name}</Typography>
            </Box>

            <Collapse in={open}>
              <JsonView data={row.task_request} />
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

function JsonView({ data }: { data: any }) {
  return (
    <Box
      component="pre"
      sx={{
        p: 1,
        ml: 4,
        overflow: "auto",
        fontFamily: "monospace",
        bgcolor: "action.hover",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  );
}

export function QueueView() {
  useQueueEvents();

  const queuedTasks = useGetQueuedTasks();
  const allTasks = useGetAllTasks();
  const historicTasks = useGetHistoricTasks();
  const moveTaskMutation = useMoveTask();
  const [showHistoric, setShowHistoric] = useState(false);

  const tasksToDisplay = useMemo<TaskWithPosition[]>(() => {
    if (showHistoric) return allTasks.data ?? [];

    const queued = queuedTasks.data ?? [];
    const latestHistoricTask = historicTasks.data?.at(-1);

    if (latestHistoricTask == null || latestHistoricTask.status !== "Error") {
      return queued;
    }

    return [latestHistoricTask, ...queued];
  }, [historicTasks.data, queuedTasks.data, allTasks.data, showHistoric]);

  const tableData = useMemo<QueueTableData[]>(() => {
    return getTableData(tasksToDisplay ?? []);
  }, [tasksToDisplay]);

  const columns = useMemo<MRT_ColumnDef<QueueTableData>[]>(
    () => [
      { accessorKey: "position", header: "Position", size: 100 },
      { accessorKey: "name", header: "Name", size: 100 },
      {
        accessorKey: "instrumentSession",
        header: "Instrument Session",
        size: 150,
      },
      { accessorKey: "samplePosition", header: "Sample Position", size: 150 },
      { accessorKey: "density", header: "Density", size: 150 },
      { accessorKey: "beamSize", header: "Beam size (μm)", size: 150 },
      { accessorKey: "timePerPDF", header: "Time per PDF (sec)", size: 150 },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue<string>()}
            variant="outlined"
            color={CHIP_COLOR_MAP[cell.getValue<Status>()]}
          ></Chip>
        ),
      },
      {
        accessorKey: "cancel",
        header: "",
        size: 150,
        enableColumnActions: false,
        Cell: ({ row }) => {
          const task = row.original;
          const isDisabled = task.status != "Queued";
          return (
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={isDisabled}
              onClick={() => cancelTasks([task.id])}
            >
              Cancel
            </Button>
          );
        },
      },
    ],
    [CHIP_COLOR_MAP],
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: tableData,
    enableRowOrdering: true,
    enableRowDragging: true,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableExpanding: true,
    muiDetailPanelProps: { sx: { py: 0, backgroundColor: "action.hover" } },
    muiRowDragHandleProps: ({ row, table }) => {
      const isDraggable = row.original.status === "Queued";
      return {
        draggable: isDraggable,
        sx: !isDraggable ? { display: "none" } : undefined,
        onDragEnd: () => {
          const draggedRow = table.getState().draggingRow;
          const targetRow = table.getState().hoveredRow;

          if (
            !draggedRow ||
            draggedRow.original.position === null ||
            !targetRow ||
            targetRow.index === undefined
          )
            return;

          const newPosition = calculateNewPosition(
            draggedRow.original.position,
            draggedRow.index,
            targetRow.index,
          );

          moveTaskMutation.mutate({
            taskId: draggedRow.original.id,
            newPosition: newPosition,
          });
        },
      };
    },
    renderTopToolbarCustomActions: () => (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={showHistoric}
                onChange={(e) => setShowHistoric(e.target.checked)}
              ></Switch>
            }
            label="Show historic tasks"
          ></FormControlLabel>
          <Button
            variant="outlined"
            color="error"
            disabled={!showHistoric}
            onClick={() => clearHistory()}
          >
            Clear History
          </Button>
        </div>
        <QueueStatusPanel />
      </Stack>
    ),

    renderDetailPanel: ({ row }) => {
      const blueapi_calls = row.original.task.blueapi_calls;

      return (
        <Box sx={{ p: 2 }}>
          {row.original.task.kind == "Experiment" ? (
            <PlanStatusPanel data={blueapi_calls} />
          ) : (
            <JsonView data={blueapi_calls[0].task_request} />
          )}
        </Box>
      );
    },
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Stack direction={"column"} spacing={4} alignItems={"center"}>
        <MaterialReactTable table={table} />
      </Stack>
    </Box>
  );
}
