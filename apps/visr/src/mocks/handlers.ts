import { http, HttpResponse, graphql } from "msw";
import workflowsResponse from "./workflows-response.json";
import plansResponse from "./plans-response.json";
import { binnedReadback, binnedSetpoint, mapData } from "./mock_data";
import type { TrackableTask, WorkerState } from "@atlas/blueapi";
import type { ScanEventMessage } from "../hooks/scanEvents";
import instrumentSessionResponse from "./instrumentSessions-response.json";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";

// busy for the fake scan, and a little after it, as if tidying up
let mockWorkerState: WorkerState = "IDLE";
const WORKER_TIDY_UP_MS = 1500;

export const handlers = [
  // Query handler
  graphql.query("TemplateViewQuery", async () => {
    return HttpResponse.json({
      data: workflowsResponse.data,
    });
  }),

  // Instrument session query handler
  graphql.query("InstrumentSessionQuery", async () => {
    return HttpResponse.json({
      data: instrumentSessionResponse.data,
    });
  }),

  // Mutation handler
  graphql.mutation("submitWorkflowTemplateMutation", async () => {
    return HttpResponse.json({
      data: {
        submitWorkflowTemplate: {
          name: "mockSubmittedName",
        },
      },
    });
  }),

  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(plansResponse);
  }),

  http.put("/api/blueapi/worker/task", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
    });
  }),

  // The fake scan's task, so the scan status line can name it ("Test scan")
  http.get("/api/blueapi/worker/task", () => {
    return HttpResponse.json({ task_id: fakeTaskId });
  }),

  http.get("/api/blueapi/tasks/:taskId", ({ params }) => {
    const task: TrackableTask = {
      task_id: String(params.taskId),
      task: { name: "test_scan", params: { scan_type: "test" }, metadata: {} },
      request_id: null,
      is_complete: true,
      is_pending: false,
      errors: [],
      outcome: { outcome: "success" },
    };
    return HttpResponse.json(task);
  }),

  http.post("/api/blueapi/tasks", () => {
    return HttpResponse.json({
      task_id: fakeTaskId,
      status: 201,
    });
  }),

  http.put("/api/blueapi/worker/state", () => {
    return HttpResponse.json("IDLE");
  }),

  http.get("/api/blueapi/worker/state", () => {
    return HttpResponse.json(mockWorkerState);
  }),

  http.get("/api/data/binned/:uuid", ({ request }) => {
    const url = new URL(request.url);
    const setPoints = url.searchParams.get("setpoints");
    let data;
    if (String(setPoints).toLowerCase() !== "true") {
      data = binnedSetpoint;
    } else {
      data = binnedReadback;
    }
    return HttpResponse.json(data);
  }),

  http.get("/api/data/map", ({ request }) => {
    const url = new URL(request.url);
    const filepath = url.searchParams.get("filepath");
    const datapath = url.searchParams.get("datapath");
    const snake: boolean = JSON.parse(url.searchParams.get("snake")!);
    console.log("Mock /api/data/map called", { filepath, datapath, snake });
    const data = mapData(snake);
    return HttpResponse.json({ values: data });
  }),

  http.get("/api/data/events", async () => {
    const encoder = new TextEncoder();

    // Create a ReadableStream that emits fake scan events
    const stream = new ReadableStream({
      start(controller) {
        const send = (event: ScanEventMessage) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        };

        // scan starts
        mockWorkerState = "RUNNING";
        send({
          uuid: "fake-scan-uuid",
          filepath: "/mock/path/fake.nxs",
          status: "running",
          snake: true,
        });

        // simulate data collection for ~5 seconds
        let counter = 0;
        const interval = setInterval(() => {
          counter++;
          //console.log("Mock event tick", counter);
          if (counter >= 25) {
            clearInterval(interval);
            // Scan stops
            send({
              uuid: "fake-scan-uuid",
              filepath: "/mock/path/fake.nxs",
              status: "finished",
              snake: true,
            });
            setTimeout(() => (mockWorkerState = "IDLE"), WORKER_TIDY_UP_MS);
          }
        }, 200);
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
];
