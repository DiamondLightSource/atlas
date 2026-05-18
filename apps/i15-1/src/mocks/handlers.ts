import { http, HttpResponse, ws } from "msw";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
let workerStatus = { status: "IDLE", duration: 0 };

function setWorkerState(new_state: string) {
  workerStatus.status = new_state;
}

const fakePvws = ws.link("wss://pvws.diamond.ac.uk/pvws/pv");

export const handlers = [
  http.put("/api/worker/task", () => {
    setWorkerState("RUNNING");
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/tasks", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.get("/api/tasks/:task_id", () => {
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

  http.put("/api/worker/state", async ({ request }) => {
    // @ts-ignore
    const { new_state } = await request.json();
    if (new_state === "ABORTING") {
      setWorkerState(new_state);
    }
    return HttpResponse.json(workerStatus.status);
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
