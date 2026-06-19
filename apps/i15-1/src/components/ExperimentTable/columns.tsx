import type { MRT_ColumnDef } from "material-react-table";

export type ExperimentTableData = {
  experimentName: string;
  sampleName: string;
  composition: string;
  density: number;
  beamEnergy: number;
  beamSize: number;
  timePerPDF: number;
};

export const columns: MRT_ColumnDef<ExperimentTableData>[] = [
  { header: "Experiment Name", accessorKey: "experimentName" },
  { header: "Sample Name", accessorKey: "sampleName" },
  { header: "Composition", accessorKey: "composition" },
  { header: "Density", accessorKey: "density" },
  { header: "Beam Energy (keV)", accessorKey: "beamEnergy" },
  { header: "Beam Size (μm)", accessorKey: "beamSize" },
  { header: "Time per PDF (sec)", accessorKey: "timePerPDF" },
];
