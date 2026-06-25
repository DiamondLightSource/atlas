import type { Status } from "../../generated/queue";

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
