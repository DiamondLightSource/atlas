import { useQuery, useMutation } from "@apollo/client/react";
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
import { addPuckToTableMutation } from "../../graphql/addPuckToTableMutation";
import { removePuckFromTableMutation } from "../../graphql/removePuckFromTableMutation";
import type {
  GetContainersForInstrumentQuery,
  GetContainersForInstrumentQueryVariables,
} from "../../graphql/getContainersForInstrumentQuery.generated";
import type {
  AddPuckToTableMutation,
  AddPuckToTableMutationVariables,
} from "../../graphql/addPuckToTableMutation.generated";
import type {
  RemovePuckFromTableMutation,
  RemovePuckFromTableMutationVariables,
} from "../../graphql/removePuckFromTableMutation.generated";

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

const ADD_PUCK_TO_TABLE: TypedDocumentNode<
  AddPuckToTableMutation,
  AddPuckToTableMutationVariables
> = addPuckToTableMutation;

const REMOVE_PUCK_FROM_TABLE: TypedDocumentNode<
  RemovePuckFromTableMutation,
  RemovePuckFromTableMutationVariables
> = removePuckFromTableMutation;

const ROBOT_TABLE_NAME = "i15-1 robot table";
const INSTRUMENT_KEY = "I15-1";
const PUCK_CONTAINER_TYPE = "i15-1 puck";

export function PucksTable() {
  const location = useLocation();
  const [selectedPositions, setSelectedPositions] = useState<
    Record<string, number | null>
  >({});

  const { data, loading, error } = useQuery(GET_CONTAINERS, {
    variables: {
      instrumentKeys: [INSTRUMENT_KEY],
    },
    fetchPolicy: "cache-and-network",
    context: { pathname: location.pathname },
  });

  const [mountPuck] = useMutation(ADD_PUCK_TO_TABLE, {
    refetchQueries: [GET_CONTAINERS],
    context: { pathname: location.pathname },
  });

  const [unmountPuck] = useMutation(REMOVE_PUCK_FROM_TABLE, {
    refetchQueries: [GET_CONTAINERS],
    context: { pathname: location.pathname },
  });

  const tableData = useMemo<PuckTableData[]>(() => {
    const edges = data?.containers.edges ?? [];

    return edges
      .filter((edge) => edge.node.type.name === PUCK_CONTAINER_TYPE)
      .map((edge) => ({
        id: String(edge.node.id),
        barcode: edge.node.barcode ?? "",
        session:
          edge.node.instrumentSessions[0]?.instrumentSessionReference ?? "",
        parentPosition: edge.node.positionInParent?.position ?? null,
        status:
          edge.node.parent?.name === ROBOT_TABLE_NAME ? "Mounted" : "Unmounted",
      }));
  }, [data]);

  const { robotTableId, positionOptions } = useMemo(() => {
    const edges = data?.containers.edges ?? [];
    const robotTableNode = edges.find(
      (edge) => edge.node.name === ROBOT_TABLE_NAME,
    );
    const numberOfPositions =
      robotTableNode?.node.type.numberOfContainerPositions ?? 0;

    return {
      robotTableId: robotTableNode?.node.id ?? null,
      positionOptions: Array.from(
        { length: numberOfPositions },
        (_, index) => index + 1,
      ),
    };
  }, [data]);

  useEffect(() => {
    // Use the initial values grabbed from the server to seed the selectedPositions state, but don't overwrite any user changes
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
                {positionOptions.map((position) => (
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
        id: "mountStatus",
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
        id: "setMount",
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
              onClick={() => {
                if (isMounted) {
                  void unmountPuck({
                    variables: {
                      tableId: robotTableId,
                      puckId: [row.original.id],
                    },
                  });
                } else {
                  void mountPuck({
                    variables: {
                      puckId: row.original.id,
                      tableId: robotTableId,
                      position: selectedPositions[rowId]!,
                    },
                  });
                }
              }}
            >
              {isMounted ? "Unmount" : "Mark as mounted"}
            </Button>
          ) : null;
        },
      },
    ],
    [selectedPositions, positionOptions, robotTableId, mountPuck, unmountPuck],
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
      isLoading: loading && !data,
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
