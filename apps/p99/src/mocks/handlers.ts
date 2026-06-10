import { http, HttpResponse } from "msw";
import plansResponse from "./plans-response.json";
import devicesResponse from "./devices-response.json";

const fakeTaskId = "46709394";
let workerState = "IDLE";
const triggerRunningState = async () => {
  workerState = "RUNNING";

  setTimeout(() => {
    workerState = "IDLE";
  }, 1000);
};
export const handlers = [
  http.get("/api/plans", () => {
    return HttpResponse.json(plansResponse);
  }),
  http.get("/api/devices", () => {
    return HttpResponse.json(devicesResponse);
  }),
  http.get("/api/worker/state", () => {
    return HttpResponse.json(workerState);
  }),
  http.put("/api/worker/task", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),
  http.get("/api/worker/task", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/tasks", () => {
    triggerRunningState();
    return HttpResponse.json({ task_id: fakeTaskId }, { status: 201 });
  }),
];
