import type { Status, TaskWithPosition } from "../../generated/queue";

export type QueueTableData = {
  task: TaskWithPosition;
  position: number | null;
  name: string;
  id: string;
  instrumentSession: string;
  sampleId: string;
  samplePosition: string;
  density: number | null;
  beamSize: number | null;
  timePerPDF: number | null;
  status: Status;
};
