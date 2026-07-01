import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  type ChipProps,
} from "@mui/material";
import { useMemo, useState } from "react";
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
import {
  calculateNewPosition,
  getTableData,
  positionFromName,
} from "../queue/queueUtils";
import type {
  Experiment,
  Status,
  TaskRequest,
  TaskWithPosition,
} from "../../generated/queue";

function getChipColorMap(): Record<Status, ChipProps["color"]> {
  return {
    Queued: "default",
    "In progress": "info",
    Complete: "success",
    Cancelled: "warning",
    Error: "error",
  };
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
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Stack direction={"column"} spacing={4} alignItems={"center"}>
        <MaterialReactTable table={table} />
      </Stack>
    </Box>
  );
}
