import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  type ChipProps,
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
  useGetQueuedTasks,
  useMoveTask,
  useQueueEvents,
} from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import { QueueStatusPanel } from "../queue/QueueStatusPanel";
import type { UseQueryResult } from "@tanstack/react-query";
import { calculateNewPosition, getTableData } from "../queue/queueUtils";
import type {
  BlueapiCallResponse,
  CallStatus,
  Experiment,
  Status,
  TaskRequest,
  TaskWithPosition,
} from "../../generated/queue";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";

function getChipColorMap(): Record<Status | CallStatus, ChipProps["color"]> {
  return {
    Queued: "primary",
    Waiting: "primary",
    "In progress": "info",
    Claimed: "info",
    Complete: "success",
    Success: "success",
    Cancelled: "warning",
    Error: "error",
    Skipped: "primary",
  };
}

function getChipIconMap(): Record<CallStatus, ChipProps["icon"]> {
  return {
    Success: <CheckCircleIcon />,
    Error: <ErrorIcon />,
    "In progress": <CircularProgress size={10} thickness={4} />,
    Claimed: <CircularProgress size={20} thickness={6} />,
    Waiting: <CircleOutlinedIcon />,
    Skipped: <DoDisturbIcon />,
  };
}

function DetailPanelTable({ data }: { data: BlueapiCallResponse[] }) {
  const tableData = useMemo(
    () =>
      data.map((call) => ({
        status: call.status,
        name: call.task_request.name,
      })),
    [data],
  );

  const colorMap = useMemo(() => getChipColorMap(), []);
  const iconMap = useMemo(() => getChipIconMap(), []);

  return (
    <Box>
      {tableData.map((row, i) => {
        const status = row.status;
        const color = colorMap[status];

        const icon = cloneElement(iconMap[status] as React.ReactElement, {
          color: color,
        });

        return (
          <Box
            key={`${row.name}-${i}`}
            sx={{
              padding: 26,
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 0.4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>{icon}</Box>
            <Typography variant="body2">{row.name}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function QueueView() {
  useQueueEvents();

  const queuedTasks = useGetQueuedTasks();
  const allTasks = useGetAllTasks();
  const moveTaskMutation = useMoveTask();
  const [showHistoric, setShowHistoric] = useState(false);

  const tasksToDisplay = useMemo<
    UseQueryResult<TaskWithPosition[], Error>
  >(() => {
    if (showHistoric) return allTasks;
    else return queuedTasks;
  }, [queuedTasks, allTasks, showHistoric]);

  const data = useMemo<QueueTableData[]>(() => {
    return getTableData(tasksToDisplay.data ?? []);
  }, [tasksToDisplay.data]);

  const colorMap = useMemo(() => getChipColorMap(), []);

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
            color={colorMap[cell.getValue<Status>()]}
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
    [colorMap],
  );

  const table = useMaterialReactTable({
    columns,
    data,
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
          <DetailPanelTable data={blueapi_calls} />
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
