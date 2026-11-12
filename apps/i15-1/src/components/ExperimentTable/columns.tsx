import type { MRT_ColumnDef } from "material-react-table";
import type { ExperimentNode } from "../../graphql/getSessionPlaylistQueryTyped";
import type {
  ExperimentDefinitionData,
  SampleData,
} from "./ULIMSExperimentsTable";

export type ExperimentTableData = {
  experiment: ExperimentNode<SampleData, ExperimentDefinitionData>;
  experimentName: string;
  sampleName: string;
  composition: string;
  density: number;
  beamEnergy: number;
  beamSize: number;
  timePerPDF: number;
  listOfTemperatures: number[] | undefined;
};

export const columns: MRT_ColumnDef<ExperimentTableData>[] = [
  { header: "Experiment Name", accessorKey: "experimentName" },
  { header: "Sample Name", accessorKey: "sampleName" },
  { header: "Composition", accessorKey: "composition" },
  { header: "Density", accessorKey: "density", maxSize: 120 },
  { header: "Beam Energy (keV)", accessorKey: "beamEnergy" },
  { header: "Beam Size (μm)", accessorKey: "beamSize", maxSize: 150 },
  {
    header: "Time per PDF (s)",
    //Header: () => <div style={{ whiteSpace: "normal" }}>Time per PDF (s)</div>,
    accessorKey: "timePerPDF",
    maxSize: 120,
  },
  {
    header: "Temperatures (°C)",
    accessorKey: "listOfTemperatures",
    Cell: ({ cell }) => (cell.getValue<string[]>() ?? []).join(", "),
  },
];
