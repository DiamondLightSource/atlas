import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
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
  useGetHistoricTasks,
  useGetQueuedTasks,
  useMoveTask,
  useQueueEvents,
} from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import { QueueStatusPanel } from "../queue/QueueStatusPanel";
import { calculateNewPosition, getTableData } from "../queue/queueUtils";
import type { Status, TaskWithPosition } from "../../generated/queue";
import { CHIP_COLOR_MAP } from "../queue/queueConstants";
import { PlanStatusPanel } from "../queue/PlanStatusPanel";
import { JsonView } from "../components/JsonView";

export function QueueView() {
  useQueueEvents();

  const queuedTasks = useGetQueuedTasks();
  const allTasks = useGetAllTasks();
  const historicTasks = useGetHistoricTasks();
  const moveTaskMutation = useMoveTask();
  const [showHistoric, setShowHistoric] = useState(false);

  // The latest historic task is prepended to the queue, so wait for both to
  // avoid briefly showing it on its own.
  const isLoading = showHistoric
    ? allTasks.isPending
    : queuedTasks.isPending || historicTasks.isPending;
  const error = showHistoric
    ? allTasks.error
    : (queuedTasks.error ?? historicTasks.error);

  const tasksToDisplay = useMemo<TaskWithPosition[]>(() => {
    if (showHistoric) return allTasks.data ?? [];

    if (isLoading) return [];

    const queued = queuedTasks.data ?? [];
    const latestHistoricTask = historicTasks.data?.at(-1);

    if (latestHistoricTask == null || latestHistoricTask.status !== "Error") {
      return queued;
    }

    return [latestHistoricTask, ...queued];
  }, [
    historicTasks.data,
    isLoading,
    queuedTasks.data,
    allTasks.data,
    showHistoric,
  ]);

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
    [],
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: tableData,
    state: {
      showSkeletons: isLoading,
      showAlertBanner: !!error,
    },
    muiToolbarAlertBannerProps: error
      ? { color: "error", children: `Error: ${error.message}` }
      : undefined,
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
      // Skeleton rows shown while loading have no task
      if (!row.original.task) return null;

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
    <Box sx={{ display: "flex", height: "100%", width: "100%", gap: 1 }}>
      <Stack
        direction={"column"}
        spacing={4}
        alignItems={"stretch"}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <MaterialReactTable table={table} />
      </Stack>
    </Box>
  );
}
