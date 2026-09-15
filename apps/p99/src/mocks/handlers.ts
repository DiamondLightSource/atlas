import { http, HttpResponse, graphql } from "msw";
import plansResponse from "./plans-response.json";
import devicesResponse from "./devices-response.json";
import templateResponse from "./template-response.json";
import tiledScansResponse from "./tiled-scans-response.json";
import tiledPrimaryResponse from "./tiled-primary-response.json";
import tiledStageXResponse from "./tiled-stage-x-response.json";
import tiledStageYResponse from "./tiled-stage-y-response.json";

const fakeTaskId = "46709394";
let workerState = "IDLE";
const triggerRunningState = async () => {
  workerState = "RUNNING";

  setTimeout(() => {
    workerState = "IDLE";
  }, 1000);
};
export const handlers = [
  ///// BLUEAPI /////
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

  ///// TILED /////
  http.get("/tiled/scans", () => {
    return HttpResponse.json(tiledScansResponse);
  }),
  http.get("/tiled/primary", () => {
    return HttpResponse.json(tiledPrimaryResponse);
  }),
  http.get("/tiled/data/sample_stage-x", () => {
    return HttpResponse.json(tiledStageXResponse);
  }),
  http.get("/tiled/data/sample_stage-y", () => {
    return HttpResponse.json(tiledStageYResponse);
  }),

  ///// AUTH /////
  http.get("/oauth2/userinfo", () => {
    return HttpResponse.json({ preferredUsername: "abc123456" });
  }),

  ///// GRAPHQL /////
  graphql.query("templateViewQuery", async () => {
    return HttpResponse.json(templateResponse);
  }),

  graphql.mutation("submitWorkflowTemplateMutation", async ({ variables }) => {
    if (
      variables.visit.proposalCode === "ne" &&
      variables.visit.proposalNumber === 11111 &&
      variables.visit.number === 1
    ) {
      return HttpResponse.error();
    } else if (
      variables.visit.proposalCode === "ge" &&
      variables.visit.proposalNumber === 22222 &&
      variables.visit.number === 1
    ) {
      return HttpResponse.json({
        data: {
          submitWorkflowTemplate: {
            name: variables.templateName,
          },
        },
        errors: [{ message: "GraphQL Error" }],
      });
    } else {
      return HttpResponse.json({
        data: {
          submitWorkflowTemplate: {
            name: variables.templateName,
          },
        },
      });
    }
  }),
];
