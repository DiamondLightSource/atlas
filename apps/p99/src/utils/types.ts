import type { Visit } from "@diamondlightsource/sci-react-ui";
import type { PayloadError } from "relay-runtime";

export interface SubmissionSuccessMessage {
  type: "success";
  message: string;
}

export interface SubmissionNetworkErrorMessage {
  type: "networkError";
  error: Error;
}

export interface SubmissionGraphQLErrorMessage {
  type: "graphQLError";
  errors: PayloadError[];
}

export interface SubmissionData {
  submissionResult:
    | SubmissionSuccessMessage
    | SubmissionGraphQLErrorMessage
    | SubmissionNetworkErrorMessage;
  visit: Visit;
  workflowName?: string;
}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONValue[];

export interface JSONObject {
  [key: string]: JSONValue;
}

export type WorkflowStatus =
  | "Unknown"
  | "WorkflowPendingStatus"
  | "WorkflowRunningStatus"
  | "WorkflowSucceededStatus"
  | "WorkflowFailedStatus"
  | "WorkflowErroredStatus";

export type Status = "unknown" | "pending" | "complete" | "running" | "error";

export interface TaskBase {
  name: string;
  params: object;
}

export interface Task extends TaskBase {
  metadata: object;
}

export interface TaskListItem {
  task_id: string;
  task: Task;
  request_id: string | null;
  is_complete: boolean;
  is_pending: boolean;
  errors: string[];
}

export interface TaskListResponse {
  tasks: TaskListItem[];
}

export interface TiledResponse {
  data: TiledData;
  error: any;
  links: any;
  meta: any;
}

export interface TilePageCount {
  count: number;
}

export interface TiledSearchMetadata {
  start: {
    plan_name: string;
    time: number;
    scan_id: number;
    scan_file: string;
  };
  stop?: unknown;
}

export interface TiledEntryInfo {
  id: string;
  running: boolean;
}

export interface TiledSearchData {
  id: string;
  attributes: { metadata: TiledSearchMetadata };
}

export interface TiledSearchResponse {
  data: TiledSearchData[];
  error: unknown;
  links: unknown;
  meta: TilePageCount;
}

export interface TiledData {
  id: string;
  attributes: Attributes;
  links: Record<string, string>;
  meta: any;
}

export interface Attributes {
  ancestors: string[];
  structure_family?: any;
  specs: Spec[];
  metadata: Metadata;
  structure: {
    contents: any;
    count: number;
  };
  access_blob: {
    tags: string[];
  };
  sorting: {
    key: string;
    direction: number;
  }[];
  data_sources: any;
}

export interface Spec {
  name: string;
  version: string | null;
}

export interface Metadata {
  uid: string;
  time: number;
  hints: Record<string, { fields: string[] }>;
  data_keys: Record<string, DataKey>;
  configuration: Record<string, Configuration>;
}

export interface DataKey {
  dtype: any;
  shape?: number[] | string;
  units?: string;
  limits?: Limits;
  source: string;
  precision?: number;
  dtype_numpy: string;
  object_name?: string;
}

export interface Limits {
  control: {
    low: number;
    high: number;
  };
  display: {
    low: number;
    high: number;
  };
}

export interface Configuration {
  data: Record<string, number | string>;
  data_keys: Record<string, DataKey>;
  timestamps: Record<string, number>;
}
