import { useQuery } from "@apollo/client/react";
import type { TypedDocumentNode } from "@apollo/client";
import {
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  type ChipProps,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { getContainersForInstrumentQuery } from "../../graphql/getContainersForInstrumentQuery";
import type {
  GetContainersForInstrumentQuery,
  GetContainersForInstrumentQueryVariables,
} from "../../graphql/getContainersForInstrumentQuery.generated";

type PuckTableData = {
  id: string;
  barcode: string;
  session: string;
  parentPosition: number | null;
  status: PuckMountStatus;
};

type PuckMountStatus = "Mounted" | "Unmounted";

export const CHIP_COLOR_MAP = {
  Mounted: "success",
  Unmounted: "info",
} satisfies Record<PuckMountStatus, ChipProps["color"]>;

const GET_CONTAINERS: TypedDocumentNode<
  GetContainersForInstrumentQuery,
  GetContainersForInstrumentQueryVariables
> = getContainersForInstrumentQuery;

const POSITION_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);

export function PucksTable() {
  const location = useLocation();
  const [selectedPositions, setSelectedPositions] = useState<
    Record<string, number | null>
  >({});

  const { data, loading, error } = useQuery(GET_CONTAINERS, {
    variables: {
      instrumentKeys: ["I15-1"],
    },
    fetchPolicy: "cache-and-network",
    context: { pathname: location.pathname },
  });

  const tableData = useMemo<PuckTableData[]>(() => {
    const edges = data?.containers.edges ?? [];

    return edges
      .filter((edge) => edge.node.type.name === "i15-1 puck")
      .map((edge) => ({
        id: String(edge.node.id),
        barcode: edge.node.barcode ?? "",
        session:
          edge.node.instrumentSessions[0]?.instrumentSessionReference ?? "",
        parentPosition: edge.node.positionInParent?.position ?? null,
        status:
          edge.node.parent?.name === "i15-1 robot table"
            ? "Mounted"
            : "Unmounted",
      }));
  }, [data]);

  useEffect(() => {
    setSelectedPositions((current) => {
      const seeded: Record<string, number | null> = {};
      for (const row of tableData) {
        if (!Object.prototype.hasOwnProperty.call(current, row.id)) {
          seeded[row.id] = row.parentPosition;
        }
      }
      return Object.keys(seeded).length > 0
        ? { ...seeded, ...current }
        : current;
    });
  }, [tableData]);

  const columns = useMemo<MRT_ColumnDef<PuckTableData>[]>(
    () => [
      { accessorKey: "barcode", header: "Puck ID" },
      {
        accessorKey: "parentPosition",
        header: "Puck Position",
        Cell: ({ row }) => {
          const rowId = row.original.id;

          return (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedPositions[rowId] ?? ""}
                displayEmpty
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSelectedPositions((current) => ({
                    ...current,
                    [rowId]:
                      typeof nextValue === "string" && nextValue === ""
                        ? null
                        : Number(nextValue),
                  }));
                }}
              >
                <MenuItem value="" disabled>
                  <em>Assign</em>
                </MenuItem>
                {POSITION_OPTIONS.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      },
      { accessorKey: "session", header: "Session" },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue<PuckMountStatus>()}
            variant="outlined"
            color={CHIP_COLOR_MAP[cell.getValue<PuckMountStatus>()]}
          ></Chip>
        ),
      },
      {
        accessorKey: "status",
        header: "",
        size: 200,
        enableColumnActions: false,
        Cell: ({ row }) => {
          const rowId = row.original.id;
          const isVisible = selectedPositions[rowId] != null;
          const isMounted = row.original.status === "Mounted";
          return isVisible ? (
            <Button
              variant="contained"
              color={isMounted ? "success" : "info"}
              size="small"
              onClick={() => {}}
            >
              {isMounted ? "Unmount" : "Mark as mounted"}
            </Button>
          ) : null;
        },
      },
    ],
    [selectedPositions],
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableRowOrdering: false,
    enableRowDragging: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    renderTopToolbarCustomActions: () => (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Typography variant="h6" component="h1" textAlign="left">
          Pucks
        </Typography>
      </Stack>
    ),
    state: {
      isLoading: loading,
      showAlertBanner: !!error,
    },
    muiToolbarAlertBannerProps: error
      ? {
          color: "error",
          children: `Error: ${error.message}`,
        }
      : undefined,
  });

  return <MaterialReactTable table={table} />;
}
