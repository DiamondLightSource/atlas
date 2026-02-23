export interface TaskResponse {
  task_id: string;
}

export interface TaskRequest {
  name: string;
  params: object;
  instrument_session: string;
}

export async function createAndStartTask(
  request: TaskRequest,
): Promise<TaskResponse> {
  const task = await createTask(request);
  return await startTask(task.task_id);
}

export async function createTask(request: TaskRequest): Promise<TaskResponse> {
  const url = "/api/tasks";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("X-Requested-By", "XMLHttpRequest");

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error ${response.status}: ${response.statusText}\n${errorText}`,
    );
  }
  return await response.json();
}

export async function startTask(task_id: string): Promise<TaskResponse> {
  const url = "/api/worker/task";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("X-Requested-By", "XMLHttpRequest");

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ task_id: task_id }),
  });

  return await response.json();
}

export interface WorkerRequest {
  new_state: string;
  defer: boolean;
  reason: string;
}

export interface WorkerResponse {
  worker_state: string;
}

export async function setWorkerState(
  worker_request: WorkerRequest,
): Promise<WorkerResponse> {
  const url = "/api/worker/state";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("X-Requested-By", "XMLHttpRequest");

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      new_state: worker_request.new_state,
      defer: worker_request.defer,
      reason: worker_request.reason,
    }),
  });

  return await response.json();
}
