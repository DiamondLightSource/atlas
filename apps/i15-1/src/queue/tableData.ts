import type { BlueapiCallResponse, Status } from "../../generated/queue";

export type QueueTableData = {
  position: number | null;
  id: string;
  instrumentSession: string;
  sampleId: string;
  planRunning: string;
  parameters: string;
  status: Status;
  blueapTasks: BlueapiCallResponse[];
};
