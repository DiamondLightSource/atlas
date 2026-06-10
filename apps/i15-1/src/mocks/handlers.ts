import { http, HttpResponse, ws } from "msw";
import plansResponse from "./plans-response.json";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const workerStatus = { status: "IDLE", duration: 0 };

const fakeExperiments = {
  data: {
    instrumentSession: {
      experiments: {
        edges: [
          {
            node: {
              name: "Test experiment",
              sample: {
                name: "Test_sample",
                data: {
                  density: 56,
                  capillary: "bs1.5",
                  composition: "Stuff",
                  packing_fraction: 0.5,
                },
              },
              experimentDefinition: {
                name: "My Experiment",
                data: {
                  q_max: 67,
                  frames: 90,
                  beam_energy: 40,
                  time_per_pdf: 2,
                  focused_beam_size: 10,
                },
              },
            },
          },
        ],
      },
    },
  },
};

function setWorkerState(new_state: string) {
  workerStatus.status = new_state;
}

const fakePvws = ws.link("wss://pvws.diamond.ac.uk/pvws/pv");

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

  http.post("/api/graphql", () => {
    return HttpResponse.json(fakeExperiments);
  }),

  fakePvws.addEventListener("connection", () => {
    console.log("WebSocket client connecting...");
  }),

  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(plansResponse);
  }),
];
