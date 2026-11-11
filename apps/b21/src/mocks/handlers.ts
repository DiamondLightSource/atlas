import { http, HttpResponse } from "msw";
import plansResponse from "./plans-response.json";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const workerStatus = { status: "IDLE", duration: 0 };

function setWorkerState(new_state: string) {
  workerStatus.status = new_state;
}

export const handlers = [
  http.put("/api/blueapi/worker/task", () => {
    setWorkerState("RUNNING");
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/blueapi/tasks", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.get("/api/blueapi/tasks/:task_id", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
      task: { name: "fake-task", params: {}, metadata: {} },
      request_id: "00",
      is_complete: true,
      is_pending: false,
      errors: [],
      outcome: { outcome: "success", type: "str", result: null },
    });
  }),

  http.put("/api/blueapi/worker/state", async ({ request }) => {
    const { new_state } = (await request.json()) as { new_state: string };
    if (new_state === "ABORTING") {
      setWorkerState(new_state);
    }
    return HttpResponse.json(workerStatus.status);
  }),

  http.get("/oauth2/userinfo", () => {
    return HttpResponse.json({ preferredUsername: "abc123456" });
  }),

  http.get("/api/blueapi/worker/state", () => {
    if (workerStatus.duration >= 10) {
      workerStatus.status = "IDLE";
      workerStatus.duration = 0;
    } else workerStatus.duration++;
    return HttpResponse.json(workerStatus.status);
  }),

  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(plansResponse);
  }),

  http.get("/api/daq-queue/queue/state", () => {
    return HttpResponse.json({ paused: true, estimated_runtime: 500 });
  }),
];
