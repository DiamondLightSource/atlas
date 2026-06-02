import { http, HttpResponse, ws } from "msw";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const workerStatus = { status: "IDLE", duration: 0 };

const fakePvws = ws.link("wss://pvws.diamond.ac.uk/pvws/pv");

export const handlers = [
  http.put("/api/worker/task", () => {
    workerStatus.status = "RUNNING";
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/tasks", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.put("/api/worker/state", () => {
    return HttpResponse.json("IDLE");
  }),

  http.get("/oauth2/userinfo", () => {
    return HttpResponse.json({ preferredUsername: "abc123456" });
  }),

  http.get("/api/worker/state", () => {
    if (workerStatus.duration >= 10) {
      workerStatus.status = "IDLE";
      workerStatus.duration = 0;
    } else workerStatus.duration++;
    return HttpResponse.json(workerStatus.status);
  }),

  fakePvws.addEventListener("connection", () => {
    console.log("WebSocket client connecting...");
  }),
];
