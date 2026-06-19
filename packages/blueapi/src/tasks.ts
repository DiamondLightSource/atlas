import { type AxiosInstance } from "axios";

/** Task that will run a plan */
export interface Task {
  /** Name of plan to run */
  name: string;

  /** Values for parameters to plan, if any */
  params: object;

  /** Any metadata to apply to all runs within this task */
  metadata: object;
}

type TaskResult = {
  outcome: "success";
  result?: any;
  type?: string;
};

type TaskError = {
  outcome: "error";
  type?: string;
  message?: string;
};

export type TaskOutcome = TaskResult | TaskError | null;

/** A representation of a task that the worker recognizes */
export interface TrackableTask {
  task_id: string;
  task: Task;
  request_id: string | null;
  is_complete: boolean;
  is_pending: boolean;
  errors: string[];
  outcome: TaskOutcome;
}

/** Diagnostic information on the tasks */
export interface TaskListResponse {
  tasks: TrackableTask[];
}

export interface TaskResponse {
  task_id: string;
}

/** Request to run a task with related info */
export interface TaskRequest {
  /** Name of plan to run */
  name: string;

  /** Values for parameters to plan, if any */
  params?: object;

  /** Instrument session associated with this task */
  instrument_session: string;
}

export function createTasksApi(client: AxiosInstance) {
  return {
    async getAll(): Promise<TaskListResponse> {
      const { data } = await client.get("/tasks");
      return data;
    },

    async get(taskId: string): Promise<TrackableTask> {
      const { data } = await client.get(`/tasks/${taskId}`);
      return data;
    },

    async submit(request: TaskRequest): Promise<TaskResponse> {
      const { data } = await client.post("/tasks", request);
      return data;
    },

    async delete(taskId: string): Promise<TaskResponse> {
      const { data } = await client.delete(`/tasks/${taskId}`);
      return data;
    },
  };
}
