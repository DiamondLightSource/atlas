import { http, HttpResponse } from "msw";

import plansResponse from "./getPlans.json";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const taskResponse = { task_id: fakeTaskId };
const trackableTask = {
  task_id: fakeTaskId,
  task: { name: "fake-task", params: {}, metadata: {} },
  request_id: "00",
  is_complete: true,
  is_pending: false,
  errors: [],
  outcome: { outcome: "success", type: "str", result: null },
};

export const blueapi = {
  get: {
    plans: plansResponse,
    state: "IDLE",
    task: trackableTask,
  },
  post: {
    task: taskResponse,
  },
  put: {
    task: { ...taskResponse, status: 201 },
  },
};

export const blueapiHandlers = [
  http.get("/api/blueapi/plans", () => {
    return HttpResponse.json(blueapi.get.plans);
  }),

  http.put("/api/blueapi/worker/task", () => {
    return HttpResponse.json(blueapi.put.task);
  }),

  http.post("/api/blueapi/tasks", () => {
    return HttpResponse.json(blueapi.post.task);
  }),

  http.get("/api/blueapi/worker/state", () => {
    return HttpResponse.json(blueapi.get.state);
  }),

  http.get(`/api/blueapi/tasks/${fakeTaskId}`, () => {
    return HttpResponse.json(blueapi.get.task);
  }),
];
