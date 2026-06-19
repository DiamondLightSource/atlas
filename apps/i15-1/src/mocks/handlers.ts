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

const fakePvws = ws.link("wss://pvws.diamond.ac.uk/pvws/pv");

const fakeHistory = [
  {
    experiment_definition: {
      plan_name: "sleep",
      sample_id: "1",
      params: {
        time: 10,
      },
      instrument_session: "cm12345-1",
    },
    id: "aaa",
    status: "Complete",
    blueapi_calls: [
      {
        task_request: {
          name: "sleep",
          params: {
            time: 10,
          },
          instrument_session: "cm12345-1",
        },
        status: "Success",
        parent_task_id: "aaa",
        result: { outcome: "success" },
        errors: [],
        time_started: "2026-05-28T15:09:29.507128",
        time_completed: "2026-05-28T15:09:39.561053",
        blueapi_id: fakeTaskId,
      },
    ],
    position: 0,
  },
];

const fakeQueue = [
  {
    experiment_definition: {
      plan_name: "robot_load",
      sample_id: "1",
      params: {
        puck: 1,
        position: 1,
      },
      instrument_session: "cm12345-1",
    },
    id: "bbb",
    status: "In progress",
    blueapi_calls: [
      {
        task_request: {
          name: "robot_load",
          params: {
            puck: 1,
            position: 1,
          },
          instrument_session: "cm12345-1",
        },
        status: "In progress",
        parent_task_id: "bbb",
        result: null,
        errors: [],
        time_started: "2026-05-28T15:09:39.812345",
        time_completed: null,
        blueapi_id: fakeTaskId,
      },
    ],
    position: 1,
  },
  {
    experiment_definition: {
      plan_name: "static_collection_plan",
      sample_id: "1",
      params: {
        frames: 10,
        exposure_time: 0.5,
      },
      instrument_session: "cm12345-1",
    },
    id: "ccc",
    status: "Queued",
    blueapi_calls: [
      {
        task_request: {
          name: "Queued",
          params: {
            frames: 10,
            exposure_time: 0.5,
          },
          instrument_session: "cm12345-1",
        },
        status: "Waiting",
        parent_task_id: "ccc",
        result: null,
        errors: [],
        time_started: null,
        time_completed: null,
        blueapi_id: fakeTaskId,
      },
    ],
    position: 2,
  },
];

export const handlers = [
  http.put("/api/blueapi/worker/task", () => {
    workerStatus.status = "RUNNING";
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.post("/api/blueapi/tasks", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  http.put("/api/blueapi/worker/state", () => {
    return HttpResponse.json("IDLE");
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

  http.post("/api/graphql", async () => {
    return HttpResponse.json(fakeExperiments);
  }),

  fakePvws.addEventListener("connection", () => {
    console.log("WebSocket client connecting...");
  }),

  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(plansResponse);
  }),

  http.get("/api/daq-queue/queue/state", () => {
    return HttpResponse.json({ paused: true });
  }),

  http.get("/api/daq-queue/queue", () => {
    return HttpResponse.json(fakeQueue);
  }),

  http.get("/api/daq-queue/history", () => {
    return HttpResponse.json(fakeHistory);
  }),

  http.get("/api/daq-queue/tasks", () => {
    return HttpResponse.json([...fakeHistory, ...fakeQueue]);
  }),
];
