import { Box, Button, Chip, Stack } from "@mui/material";
import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  cancelTasks,
  clearHistory,
  useGetTasks,
  useMoveTask,
  useQueueEvents,
} from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import { QueueStatusPanel } from "../queue/QueueStatusPanel";
import { calculateNewPosition, getTableData } from "../queue/queueUtils";
import type { Status } from "../../generated/queue";
import { CHIP_COLOR_MAP } from "../queue/queueConstants";
import { PlanStatusPanel } from "../queue/PlanStatusPanel";
import { JsonView } from "../components/JsonView";
import { diamondFillParentTableProps } from "../components/diamondTableProps";
import { useRowReorder } from "../components/rowReorder/useRowReorder";
import { QueueEstimatedRuntime } from "../queue/QueueEstimatedRuntime";

interface QueueViewProps {
  displayMode?: "future" | "historic" | "all";
  instrument: string;
}

export function QueueView({
  displayMode = "future",
  instrument,
}: QueueViewProps) {
  useQueueEvents();

  const tasks = useGetTasks(displayMode);
  const moveTaskMutation = useMoveTask();

  const isLoading = tasks.isPending;
  const isFetching = tasks.isFetching;
  const error = tasks.error;

  const tableData = useMemo<QueueTableData[]>(() => {
    return getTableData(tasks.data ?? []);
  }, [tasks.data]);

  const columns = useMemo<MRT_ColumnDef<QueueTableData>[]>(
    () => [
      ...(displayMode !== "historic"
        ? [
            {
              accessorKey: "position",
              header: "Position",
              size: 120,
            } as MRT_ColumnDef<QueueTableData>,
          ]
        : []),
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
        accessorKey: "listOfTemperatures",
        header: "Temperatures (°C)",
        size: 150,
        Cell: ({ cell }) => (cell.getValue<string[]>() ?? []).join(", "),
      },
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
          />
        ),
      },
      ...(displayMode !== "historic"
        ? [
            {
              accessorKey: "cancel",
              header: "",
              size: 150,
              enableColumnActions: false,
              Cell: ({ row }) => {
                const task = row.original;
                const isDisabled = task.status !== "Queued";

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
            } as MRT_ColumnDef<QueueTableData>,
          ]
        : []),
    ],
    [displayMode],
  );

  const moveRow = (fromIndex: number, toIndex: number) => {
    const task = tableData[fromIndex];
    if (task?.position == null || task.status !== "Queued") return;
    if (tableData[toIndex] == null) return;

    moveTaskMutation.mutate({
      taskId: task.id,
      newPosition: calculateNewPosition(task.position, fromIndex, toIndex),
    });
  };
  const reorder = useRowReorder<QueueTableData>({
    label: "Reorder queue",
    onReorder: moveRow,
    // Only queued tasks can be moved
    isMovable: (row) => row.original.status === "Queued",
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: tableData,
    enableColumnResizing: true,
    layoutMode: "grid",
    getRowId: (row) => row.id,
    state: {
      showSkeletons: isLoading,
      showProgressBars: isFetching && !isLoading,
      showAlertBanner: !!error,
      ...reorder.state,
    },
    muiToolbarAlertBannerProps: error
      ? { color: "error", children: `Error: ${error.message}` }
      : undefined,
    ...diamondFillParentTableProps,
    ...reorder.tableOptions,
    // Rows aren't clickable; no hover state.
    muiTableBodyRowProps: { hover: false, sx: reorder.rowSx },
    muiTopToolbarProps: { sx: reorder.toolbarSx },
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableExpanding: true,
    muiDetailPanelProps: { sx: { py: 0, backgroundColor: "action.hover" } },
    renderTopToolbarCustomActions: () => (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Button
          variant="outlined"
          color="error"
          disabled={displayMode === "future"}
          onClick={() => clearHistory()}
        >
          Clear History
        </Button>
        <Stack direction="row" alignItems="center" spacing={2}>
          <QueueEstimatedRuntime />
          <QueueStatusPanel />
          {displayMode !== "historic" && reorder.toggleButton}
        </Stack>
      </Stack>
    ),

    renderDetailPanel: ({ row }) => {
      // Skeleton rows shown while loading have no task
      if (!row.original.task) return null;

      const blueapi_calls = row.original.task.blueapi_calls;

      return (
        <Box sx={{ p: 2 }}>
          {row.original.task.kind == "Experiment" ? (
            <PlanStatusPanel instrument={instrument} data={blueapi_calls} />
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
