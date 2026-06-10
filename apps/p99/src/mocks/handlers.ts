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
  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(plansResponse);
  }),
  http.get("/api/blueapi/devices", () => {
    return HttpResponse.json(devicesResponse);
  }),
  http.get("/api/blueapi/worker/state", () => {
    return HttpResponse.json(workerState);
  }),
  http.put("/api/blueapi/worker/task", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),
  http.get("/api/blueapi/worker/task", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/blueapi/tasks", () => {
    triggerRunningState();
    return HttpResponse.json({ task_id: fakeTaskId }, { status: 201 });
  }),
];
