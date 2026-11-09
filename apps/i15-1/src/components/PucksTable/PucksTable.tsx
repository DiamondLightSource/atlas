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
import { diamondTableProps } from "../diamondTableProps";
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

const CHIP_COLOR_MAP = {
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

export const ROBOT_TABLE_NAME = "i15-1 robot table";
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
      { accessorKey: "barcode", id: "puckId", header: "Puck ID" },
      {
        accessorKey: "parentPosition",
        id: "puckPosition",
        header: "Puck Position",
        size: 350,
        Cell: ({ row }) => {
          const rowId = row.original.id;
          const isMounted = row.original.status === "Mounted";
          const isVisible = selectedPositions[rowId] != null;

          const handleSelection = (nextValue: number) => {
            setSelectedPositions((current) => ({
              ...current,
              [rowId]:
                typeof nextValue === "string" && nextValue === ""
                  ? null
                  : Number(nextValue),
            }));
            void mountPuck({
              variables: {
                puckId: row.original.id,
                tableId: robotTableId,
                position: nextValue, // selectedPositions[rowId]!,
              },
            });
          };

          return (
            <Stack direction={"row"} spacing={5}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  inputProps={{
                    readOnly: isMounted,
                  }}
                  value={selectedPositions[rowId] ?? ""}
                  displayEmpty
                  onChange={(event) => handleSelection(event.target.value)}
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
              {isVisible ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    void unmountPuck({
                      variables: {
                        tableId: robotTableId,
                        puckId: [row.original.id],
                      },
                    });
                    setSelectedPositions((current) => {
                      current[rowId] = null;
                      return current;
                    });
                  }}
                >
                  Unmount
                </Button>
              ) : null}
            </Stack>
          );
        },
      },
      { accessorKey: "session", id: "session", header: "Session" },
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
    ],
    [selectedPositions, positionOptions, robotTableId, mountPuck, unmountPuck],
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    ...diamondTableProps,
    // Rows aren't clickable; no hover state.
    muiTableBodyRowProps: { hover: false },
    enableRowOrdering: false,
    enableRowDragging: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: {
      columnOrder: ["puckId", "session", "mountStatus", "puckPosition"],
    },
    renderTopToolbarCustomActions: () => (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        // MRT top-aligns the toolbar row; centre the title against it.
        sx={{ alignSelf: "center" }}
      >
        <Typography variant="h6" component="h1" textAlign="left">
          Pucks
        </Typography>
      </Stack>
    ),
    state: {
      showSkeletons: loading && !data,
      showProgressBars: loading && !!data,
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
