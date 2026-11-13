import { http, HttpResponse } from "msw";

import plansResponse from "./getPlans.json";

const fakeTaskId = "7304e8e0-81c6-4978-9a9d-9046ab79ce3c";
const task_response = { task_id: fakeTaskId };

export const blueapi = {
  get: {
    plans: plansResponse,
    state: "IDLE",
  },
  post: {
    task: task_response,
  },
  put: {
    task: { ...task_response, status: 201 },
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
];
