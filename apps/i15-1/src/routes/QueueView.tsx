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
  useGetHistoricTasks,
  useGetQueuedTasks,
  useMoveTask,
  useQueueEvents,
} from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import { QueueStatusPanel } from "../queue/QueueStatusPanel";
import type { QueuedTasks } from "../queue/tasks";
import { calculateNewPosition, positionFromName } from "../queue/queueUtils";
import type { Experiment, Status, TaskRequest } from "../../generated/queue";

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
  const historicTasks = useGetHistoricTasks();
  const moveTaskMutation = useMoveTask();
  const [showHistoric, setShowHistoric] = useState(false);

  const tasksToDisplay = useMemo<QueuedTasks>(() => {
    if (showHistoric) return allTasks.data ?? [];

    const queued = queuedTasks.data ?? [];
    const latestHistoricTask = historicTasks.data?.at(-1);

    if (latestHistoricTask == null || latestHistoricTask.status !== "Error") {
      return queued;
    }

    return [latestHistoricTask, ...queued];
  }, [historicTasks.data, queuedTasks.data, allTasks.data, showHistoric]);

  const data = useMemo<QueueTableData[]>(() => {
    return (
      tasksToDisplay.map((task) => {
        if (task.kind === "Experiment") {
          const exp = task.experiment as Experiment;

          return {
            position: task.position,
            name: exp.name,
            id: task.id,
            instrumentSession: task.experiment.instrument_session,
            sampleId: exp.sample.id,
            samplePosition: positionFromName(exp.sample.name),
            density: exp.sample.data.density as number,
            beamSize: exp.experiment_definition.data
              .focused_beam_size as number,
            timePerPDF: exp.experiment_definition.data.time_per_pdf as number,
            status: task.status,
          };
        } else {
          const plan = task.experiment as TaskRequest;

          return {
            position: task.position,
            name: plan.name,
            id: task.id,
            instrumentSession: task.experiment.instrument_session,
            sampleId: "",
            samplePosition: "",
            density: null,
            beamSize: null,
            timePerPDF: null,
            status: task.status,
          };
        }
      }) ?? []
    );
  }, [tasksToDisplay]);

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
