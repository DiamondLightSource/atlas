import { http, HttpResponse, ws, passthrough } from "msw";
import plansResponse from "./plans-response.json";

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === "true";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const workerStatus = { status: "IDLE", duration: 0 };

const fakeExperiments = {
  data: {
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
};

const fakeContainersForInstrument: {
  data: {
    containers: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          barcode: string;
          type: { name: string; numberOfContainerPositions: number | null };
          instrumentSessions: Array<{ instrumentSessionReference: string }>;
          parent: { name: string; id: string } | null;
          positionInParent: { position: number } | null;
        };
      }>;
    };
  };
} = {
  data: {
    containers: {
      edges: [
        {
          node: {
            id: "019fae86-1551-74f2-b876-f2b5dd4dbb43",
            name: "i15-1 Puck 1234",
            barcode: "i15-1_1234",
            type: {
              name: "i15-1 puck",
              numberOfContainerPositions: 0,
            },
            instrumentSessions: [
              {
                instrumentSessionReference: "CM44163-3",
              },
            ],
            parent: {
              name: "i15-1 robot table",
              id: "019fae86-9deb-7c71-ac6b-2a846f4f2bee",
            },
            positionInParent: {
              position: 1,
            },
          },
        },
        {
          node: {
            id: "019fae86-9deb-7c71-ac6b-2a846f4f2bee",
            name: "i15-1 robot table",
            barcode: "i15-1_robot_table",
            type: {
              name: "i15-1 robot table",
              numberOfContainerPositions: 20,
            },
            instrumentSessions: [],
            parent: null,
            positionInParent: null,
          },
        },
        {
          node: {
            id: "019fae9b-18b2-7430-ae82-7f6ee0acbf8f",
            name: "i15-1 cupboard 1",
            barcode: "i15-1_cupboard_1",
            type: {
              name: "i15-1 storage cupboard",
              numberOfContainerPositions: null,
            },
            instrumentSessions: [],
            parent: null,
            positionInParent: null,
          },
        },
        {
          node: {
            id: "019faee9-628d-7161-afe4-598a9c60534d",
            name: "i15-1 Puck 56789",
            barcode: "i15-1_56789",
            type: {
              name: "i15-1 puck",
              numberOfContainerPositions: 0,
            },
            instrumentSessions: [],
            parent: null,
            positionInParent: null,
          },
        },
      ],
    },
  },
};

function setWorkerState(new_state: string) {
  workerStatus.status = new_state;
}

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
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Success",
        time_started: "2026-07-14T10:40:11.224558",
        time_completed: "2026-07-14T10:40:11.586504",
        result: {
          outcome: "success",
          result: null,
          type: "NoneType",
        },
        errors: [],
        blueapi_id: "445773b4-b318-473d-9a60-83f2e38d54ba",
      },
      {
        task_request: {
          name: "centre_sample",
          params: {
            start_z: -20,
            end_z: 0,
            steps: 20,
            exposure_time: 0.01,
            metadata: {
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
          },
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Success",
        time_started: "2026-07-14T10:40:11.605521",
        time_completed: "2026-07-14T10:40:11.911974",
        result: "success",
        errors: [],
        blueapi_id: "2559ed0a-034e-43df-bf3f-2fe8b525669b",
      },
      {
        task_request: {
          name: "robot_unload",
          params: {},
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Success",
        time_started: null,
        time_completed: null,
        result: "success",
        errors: [],
        blueapi_id: null,
      },
    ],
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
    id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
    status: "Error",
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
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Success",
        time_started: "2026-07-14T10:40:11.224558",
        time_completed: "2026-07-14T10:40:11.586504",
        result: {
          outcome: "success",
          result: null,
          type: "NoneType",
        },
        errors: [],
        blueapi_id: "445773b4-b318-473d-9a60-83f2e38d54ba",
      },
      {
        task_request: {
          name: "centre_sample",
          params: {
            start_z: -20,
            end_z: 0,
            steps: 20,
            exposure_time: 0.01,
            metadata: {
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
          },
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Error",
        time_started: "2026-07-14T10:40:11.605521",
        time_completed: "2026-07-14T10:40:11.911974",
        result: null,
        errors: [
          {
            outcome: "error",
            type: "FailedStatus",
            message:
              "<AsyncStatus, device: zebra-inputs-soft_in_1, task: <coroutine object AsyncStatusBase.__init__.<locals>.wait_with_error_message at 0x7f675513d640>, errored: ValueError('0 is not a valid SoftInState')>",
          },
        ],
        blueapi_id: "2559ed0a-034e-43df-bf3f-2fe8b525669b",
      },
      {
        task_request: {
          name: "robot_unload",
          params: {},
          instrument_session: "cm44163-3",
        },
        parent_task_id: "b275be03-6375-4dc5-a31e-b1352c23dd9d",
        status: "Skipped",
        time_started: null,
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: null,
      },
    ],
    position: null,
    kind: "Experiment",
  },
];

const fakeQueue = [
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
    id: "61e500d6-33ce-432e-9ae2-42ba1d5214a0",
    status: "In progress",
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
        parent_task_id: "61e500d6-33ce-432e-9ae2-42ba1d5214a0",
        status: "Success",
        time_started: "2026-07-14T10:40:30.605521",
        time_completed: "2026-07-14T10:40:44.911974",
        result: null,
        errors: [],
        blueapi_id: "9363680a-2129-4012-9a87-58af7f963c55",
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
        parent_task_id: "61e500d6-33ce-432e-9ae2-42ba1d5214a0",
        status: "In progress",
        time_started: "2026-07-14T10:40:45.605521",
        time_completed: null,
        result: null,
        errors: [],
        blueapi_id: "3edfdaf9-71f5-4a9b-87e7-170bb97e3eab",
      },
      {
        task_request: {
          name: "robot_unload",
          params: {},
          instrument_session: "cm44163-3",
        },
        parent_task_id: "61e500d6-33ce-432e-9ae2-42ba1d5214a0",
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

  http.post("/api/graphql", async ({ request }) => {
    const body = (await request.json()) as {
      operationName?: string;
      query?: string;
    };

    if (body.operationName === "GetContainersForInstrument") {
      return HttpResponse.json(fakeContainersForInstrument);
    }

    if (body.operationName === "AddPuckToTable") {
      const { puckId, tableId, position } = (
        body as {
          variables: { puckId: string; tableId: string; position: number };
        }
      ).variables;

      const tableEdge = fakeContainersForInstrument.data.containers.edges.find(
        (e) => e.node.id === tableId,
      );
      const puckEdge = fakeContainersForInstrument.data.containers.edges.find(
        (e) => e.node.id === puckId,
      );

      if (puckEdge && tableEdge) {
        puckEdge.node.parent = {
          name: tableEdge.node.name,
          id: tableEdge.node.id,
        };
        puckEdge.node.positionInParent = { position };
      }

      return HttpResponse.json({
        data: {
          container: {
            __typename: "ContainerMutations",
            setParentContainer: {
              __typename: "SetParentContainerResponse",
              success: true,
            },
          },
        },
      });
    }

    if (body.operationName === "RemovePuckFromTable") {
      const { puckId } = (
        body as {
          variables: { tableId: string; puckId: string[] };
        }
      ).variables;

      for (const id of puckId) {
        const puckEdge = fakeContainersForInstrument.data.containers.edges.find(
          (e) => e.node.id === id,
        );

        if (puckEdge) {
          puckEdge.node.parent = null;
          puckEdge.node.positionInParent = null;
        }
      }

      return HttpResponse.json({
        data: {
          container: {
            __typename: "ContainerMutations",
            removeContainersFromContainer: {
              __typename: "RemoveContainersFromContainerResponse",
              success: true,
            },
          },
        },
      });
    }

    if (body.operationName === "GetSessionPlaylist") {
      return HttpResponse.json(fakeExperiments);
    }

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
