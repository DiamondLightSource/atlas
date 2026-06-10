import type {
  Api,
  TaskRequest,
  TaskResponse,
  TrackableTask,
} from "@atlas/blueapi";
import type { QueryClient } from "@tanstack/react-query";
import { createTestQueryClient, renderWithProviders } from "./testUtils";
import { useDeleteTask, useSubmitTask, useTask, useTasks } from "./tasks";
import { act, waitFor } from "@atlas/vitest-conf";
import { taskKeys } from "./queryKeys";
import type { TaskListResponse } from "@atlas/blueapi";

describe("Task hooks", () => {
  let api: Api;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();

    api = {
      tasks: {
        getAll: vi.fn(),
        get: vi.fn(),
        submit: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as Api;
  });

  it("calls blueapi.tasks.getAll and uses taskKeys.all for useTasks", async () => {
    const mockResponse: TaskListResponse = { tasks: [] };
    (api.tasks.getAll as any).mockResolvedValue(mockResponse);

    const { result } = renderWithProviders(() => useTasks(), api, queryClient);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });
    expect(api.tasks.getAll).toHaveBeenCalledOnce();
    const cached = queryClient.getQueryCache().find({ queryKey: taskKeys.all });
    expect(cached).toBeDefined();
  });

  it("calls blueapi.tasks.get with taskId on useTask", async () => {
    const taskId = "abc";
    const task: TrackableTask = {
      task_id: taskId,
      task: {
        name: "count",
        params: { det: "det1" },
        metadata: {},
      },
      request_id: null,
      is_pending: true,
      is_complete: false,
      errors: [],
      outcome: { outcome: "success" }
    };

    (api.tasks.get as any).mockResolvedValue(task);

    const { result } = renderWithProviders(
      () => useTask(taskId),
      api,
      queryClient,
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(task);
    });

    expect(api.tasks.get).toHaveBeenCalledExactlyOnceWith(taskId);

    const cached = queryClient.getQueryCache().find({
      queryKey: taskKeys.detail(taskId),
    });

    expect(cached).toBeDefined();
  });

  it("calls blueapi.tasks.submit and invalidates taskKeys.all on useSubmitTask", async () => {
    const request: TaskRequest = {
      name: "count",
      params: { det: "det1" },
      instrument_session: "mg12345-2",
    };

    const mockResponse: TaskResponse = { task_id: "abc123" };
    (api.tasks.submit as any).mockResolvedValue(mockResponse);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderWithProviders(
      () => useSubmitTask(),
      api,
      queryClient,
    );

    let mutationResult: TaskResponse;

    await act(async () => {
      mutationResult = await result.current.mutateAsync(request);
    });

    expect(api.tasks.submit).toHaveBeenCalledExactlyOnceWith(
      request,
      expect.any(Object),
    );

    expect(mutationResult!).toEqual(mockResponse);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: taskKeys.all });
  });

  it("calls blueapi.tasks.delete and invalidates taskKeys.all on useDeleteTask", async () => {
    const taskId = "task123";
    const task = { task_id: taskId };
    (api.tasks.delete as any).mockResolvedValue(task);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderWithProviders(
      () => useDeleteTask(),
      api,
      queryClient,
    );

    let mutationResult: TaskResponse;

    await act(async () => {
      mutationResult = await result.current.mutateAsync(taskId);
    });

    expect(api.tasks.delete).toHaveBeenCalledExactlyOnceWith(
      taskId,
      expect.any(Object),
    );

    expect(mutationResult!).toEqual(task);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: taskKeys.all });
  });
});
