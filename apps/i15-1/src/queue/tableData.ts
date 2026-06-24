import type { BlueapiCallResponse, Status } from "../../generated/queue";
import type {
  ExperimentDefinitionData,
  SampleData,
} from "../components/ExperimentTable/ULIMSExperimentsTable";

export type QueueTableData = {
  position: number | null;
  id: string;
  instrumentSession: string;
  sampleId: string;
  samplePosition: string;
  density: number | null;
  beamSize: number | null;
  timePerPDF: number | null;
  status: Status;
};
