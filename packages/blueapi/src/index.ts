import type { AccessTokenGetter } from "@atlas/auth";
import { createApiClient } from "./client";
import { createDevicesApi } from "./devices";
import { createPlansApi } from "./plans";
import { createTasksApi } from "./tasks";
import { createWorkerApi } from "./worker";

export type { Plan, PlansResponse } from "./plans";
export type {
  Task,
  TaskRequest,
  TaskResponse,
  TaskListResponse,
  TrackableTask,
} from "./tasks";
export type { WorkerState, WorkerStateRequest } from "./worker";
export type { Device, DeviceResponse } from "./devices";

export function createApi(baseURL: string, getAccessToken: AccessTokenGetter) {
  const client = createApiClient(baseURL, getAccessToken);

  return {
    devices: createDevicesApi(client),
    plans: createPlansApi(client),
    tasks: createTasksApi(client),
    worker: createWorkerApi(client),
  };
}

export type Api = ReturnType<typeof createApi>;
