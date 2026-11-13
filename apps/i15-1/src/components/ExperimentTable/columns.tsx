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
  capillary: string;
  packingFraction: number;
  beamEnergy: number;
  beamSize: number;
  timePerPDF: number;
  qMax: number;
  listOfTemperatures: number[] | null;
  rampRate: number | null;
  settleTime: number | null;
  // comment: string | null; // There's 2, one in data and one in exp definition
  // figure out later
};

export const columns: MRT_ColumnDef<ExperimentTableData>[] = [
  { header: "Experiment Name", accessorKey: "experimentName" },
  { header: "Sample Name", accessorKey: "sampleName" },
  { header: "Composition", accessorKey: "composition" },
  { header: "Density", accessorKey: "density", maxSize: 150 },
  { header: "Capillary", accessorKey: "capillary", size: 120, maxSize: 150 },
  {
    header: "Packing Fraction",
    Header: () => <div style={{ whiteSpace: "normal" }}>Packing Fraction</div>,
    accessorKey: "packingFraction",
    size: 120,
    maxSize: 150,
  },
  {
    header: "Beam Energy (keV)",
    Header: () => <div style={{ whiteSpace: "normal" }}>Beam Energy (keV)</div>,
    accessorKey: "beamEnergy",
    maxSize: 150,
  },
  {
    header: "Beam Size (μm)",
    Header: () => <div style={{ whiteSpace: "normal" }}>Beam Size (μm)</div>,
    accessorKey: "beamSize",
    maxSize: 150,
  },
  {
    header: "Time per PDF (s)",
    Header: () => <div style={{ whiteSpace: "normal" }}>Time per PDF (s)</div>,
    accessorKey: "timePerPDF",
    size: 120,
    maxSize: 150,
  },
  {
    header: "Q max (Å⁻¹)",
    Header: () => <div style={{ whiteSpace: "normal" }}>Q max (Å⁻¹)</div>,
    accessorKey: "qMax", // if missing it's 25
    size: 100,
    maxSize: 150,
  },
  {
    header: "Temperatures (°C)",
    accessorKey: "listOfTemperatures",
    Cell: ({ cell }) => (cell.getValue<string[]>() ?? []).join(", "),
  },
  {
    header: "Ramp Rate (°C/min)",
    Header: () => (
      <div style={{ whiteSpace: "normal" }}>Ramp Rate (°C/min)</div>
    ),
    accessorKey: "rampRate",
    size: 120,
    maxSize: 150,
  },
  {
    header: "Settle Time (s)",
    Header: () => <div style={{ whiteSpace: "normal" }}>Settle Time (s)</div>,
    accessorKey: "settleTime",
    size: 120,
    maxSize: 150,
  },
];
