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
