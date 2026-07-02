import { http, HttpResponse, ws, passthrough } from "msw";
import plansResponse from "./plans-response.json";

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === "true";

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
                name: "Test_8_1",
                id: "a47cd8af-03f4-430b-9858-749c61f6e14c",
                instrumentSessions: [
                  {
                    instrumentSessionReference: "CM44163-3",
                  },
                ],
                data: {
                  density: 56,
                  capillary: "bs1.5",
                  composition: "Stuff",
                  packing_fraction: 0.5,
                },
              },
              experimentDefinition: {
                name: "run_full_collection",
                id: "62b75b2f-8401-4230-b7ef-a4e577af598a",
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
          {
            node: {
              name: "Test experiment 2",
              sample: {
                name: "Test_8_2",
                id: "19ad91f0-a155-4c5c-b5ba-175bb6f7c057",
                instrumentSessions: [
                  {
                    instrumentSessionReference: "CM44163-3",
                  },
                ],
                data: {
                  density: 56,
                  capillary: "bs1.5",
                  composition: "Stuff",
                  packing_fraction: 0.5,
                },
              },
              experimentDefinition: {
                name: "run_full_collection",
                id: "b645e887-85b4-40d6-a8f0-500a436bc395",
                data: {
                  q_max: 67,
                  frames: 100,
                  beam_energy: 40,
                  time_per_pdf: 2,
                  focused_beam_size: 3,
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
    experiment: {
      name: "Test experiment",
      instrument_session: "cm44163-3",
      sample: {
        name: "Test_8_2",
        id: "a47cd8af-03f4-430b-9858-749c61f6e14c",
        data: {
          density: 56,
          capillary: "bs1.5",
          composition: "Stuff",
          packing_fraction: 0.5,
        },
      },
      experiment_definition: {
        name: "run_full_collection",
        id: "62b75b2f-8401-4230-b7ef-a4e577af598a",
        data: {
          q_max: 67,
          frames: 90,
          beam_energy: 40,
          time_per_pdf: 2,
          focused_beam_size: 10,
        },
      },
    },
    id: "b715f350-401a-48b9-929f-d6bcad064264",
    status: "Complete",
    blueapi_calls: [],
    position: null,
    kind: "Experiment",
  },
  {
    experiment: {
      name: "Test experiment",
      instrument_session: "cm44163-3",
      sample: {
        name: "Test_9_4",
        id: "a47cd8af-03f4-430b-9858-749c61f6e14c",
        data: {
          density: 56,
          capillary: "bs1.5",
          composition: "Stuff",
          packing_fraction: 0.5,
        },
      },
      experiment_definition: {
        name: "run_full_collection",
        id: "62b75b2f-8401-4230-b7ef-a4e577af598a",
        data: {
          q_max: 67,
          frames: 90,
          beam_energy: 40,
          time_per_pdf: 2,
          focused_beam_size: 10,
        },
      },
    },
    id: "b715f350-401a-48b9-929f-d6bcad064264",
    status: "Error",
    blueapi_calls: [],
    position: null,
    kind: "Experiment",
  },
];

const fakeQueue = [
  {
    experiment: {
      name: "sleep",
      params: {
        time: 10,
      },
      instrument_session: "string",
    },
    id: "1c27208a-ad57-48ed-bae0-fd36ec683230",
    status: "Queued",
    blueapi_calls: [
      {
        task_request: {
          name: "sleep",
          params: {
            time: 10,
          },
          instrument_session: "string",
        },
        parent_task_id: "1c27208a-ad57-48ed-bae0-fd36ec683230",
        status: "Waiting",
        time_started: null,
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: null,
      },
    ],
    position: 0,
    kind: "Plan",
  },
  {
    experiment: {
      name: "Test experiment",
      instrument_session: "cm44163-3",
      sample: {
        name: "Test_8_1",
        id: "a47cd8af-03f4-430b-9858-749c61f6e14c",
        data: {
          density: 56,
          capillary: "bs1.5",
          composition: "Stuff",
          packing_fraction: 0.5,
        },
      },
      experiment_definition: {
        name: "run_full_collection",
        id: "62b75b2f-8401-4230-b7ef-a4e577af598a",
        data: {
          q_max: 67,
          frames: 90,
          beam_energy: 40,
          time_per_pdf: 2,
          focused_beam_size: 10,
        },
      },
    },
    id: "b715f350-401a-48b9-929f-d6bcad064264",
    status: "Queued",
    blueapi_calls: [
      {
        task_request: {
          name: "robot_load",
          params: {
            puck: "1",
            position: "8",
          },
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b715f350-401a-48b9-929f-d6bcad064264",
        status: "Waiting",
        time_started: null,
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: null,
      },
      {
        task_request: {
          name: "centre_sample",
          params: {
            start_z: -5,
            end_z: 5,
            steps: 20,
            exposure_time: 0.01,
          },
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b715f350-401a-48b9-929f-d6bcad064264",
        status: "Waiting",
        time_started: null,
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: null,
      },
      {
        task_request: {
          name: "robot_unload",
          params: {},
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b715f350-401a-48b9-929f-d6bcad064264",
        status: "Waiting",
        time_started: null,
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: null,
      },
    ],
    position: 1,
    kind: "Experiment",
  },
];

export const handlers = [
  ...(USE_LOCAL ? [http.all("/api/blueapi/*", () => passthrough())] : []),

  ...(USE_LOCAL
    ? [
        http.all("http://127.0.0.1:8001/*", () => passthrough()),
        http.all("http://localhost:8001/*", () => passthrough()),
      ]
    : []),

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
