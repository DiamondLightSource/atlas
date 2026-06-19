import { useQuery } from "@apollo/client/react";
import { Button, Stack, Typography } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import type { TypedDocumentNode } from "@apollo/client";
import { columns, type ExperimentTableData } from "./columns";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import QueueIcon from "@mui/icons-material/Queue";

import { getSessionPlaylistQuery } from "../../graphql/getSessionPlaylistQuery";
import { type ExperimentNode } from "../../graphql/getSessionPlaylistQueryTyped";
import type {
  GetSessionPlaylistQueryVariables,
  GetSessionPlaylistQuery,
} from "../../graphql/getSessionPlaylistQuery.generated";

type ExperimentDefinitionData = {
  q_max: number;
  frames: number;
  beam_energy: number;
  time_per_pdf: number;
  focused_beam_size: number;
};

type SampleData = {
  density: number;
  capillary: string;
  composition: string;
  packing_fraction: number;
};

const convertNodeToTableData = (
  node: ExperimentNode<SampleData, ExperimentDefinitionData>,
): ExperimentTableData => ({
  experimentName: node.name,
  sampleName: node.sample.name,
  density: node.sample.data.density,
  composition: node.sample.data.composition,
  beamEnergy: node.experimentDefinition.data.beam_energy,
  timePerPDF: node.experimentDefinition.data.time_per_pdf,
  beamSize: node.experimentDefinition.data.focused_beam_size,
});

const GET_EXPERIMENTS: TypedDocumentNode<
  GetSessionPlaylistQuery,
  GetSessionPlaylistQueryVariables
> = getSessionPlaylistQuery;

export function ExperimentList() {
  const location = useLocation();

  const { data, loading, error } = useQuery(GET_EXPERIMENTS, {
    variables: {
      proposal: 44163,
      session: 3,
    },
    fetchPolicy: "cache-and-network",
    context: { pathname: location.pathname },
  });

  const experiments = data?.instrumentSession?.experiments.edges || [];

  const typedExperiments = experiments as {
    node: ExperimentNode<SampleData, ExperimentDefinitionData>;
  }[];

  const flatExperiments = useMemo(() => {
    return (typedExperiments ?? []).map((edge) =>
      convertNodeToTableData(edge.node),
    );
  }, [typedExperiments]);

  const table = useMaterialReactTable({
    columns,
    data: flatExperiments,
    enableRowOrdering: false,
    enableRowDragging: false,
    enableRowSelection: true,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedCount = table.getSelectedRowModel().rows.length;

      return (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography variant="h6" component="h1" textAlign={"left"}>
            Experiment Playlist
          </Typography>

          {selectedCount > 0 ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<QueueIcon />}
              onClick={() => {
                const selected = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original);

                console.log("Selected:", selected);
              }}
            >
              Add selected {selectedCount} to queue
            </Button>
          ) : (
            <Button variant="contained" startIcon={<QueueIcon />}>
              Add all to queue
            </Button>
          )}
        </Stack>
      );
    },

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
