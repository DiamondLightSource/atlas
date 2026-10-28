import { createApiClient } from "./client";
import { createDevicesApi } from "./devices";
import { createPlansApi } from "./plans";
import { createTasksApi } from "./tasks";
import { createWorkerApi } from "./worker";
import type { LoginFn } from "../../auth/src/loginRedirect";

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

export function createApi(baseURL: string, login: LoginFn) {
  const client = createApiClient(baseURL, login);

  return {
    devices: createDevicesApi(client),
    plans: createPlansApi(client),
    tasks: createTasksApi(client),
    worker: createWorkerApi(client),
  };
}

export type Api = ReturnType<typeof createApi>;
