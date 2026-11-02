import { vi, beforeEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@atlas/vitest-conf";

const mocks = vi.hoisted(() => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return {
    ...axiosInstance,
    createAxiosWithLoginRedirect: vi.fn(() => axiosInstance),
    login: vi.fn(),
  };
});

vi.mock("@atlas/auth/axios", () => ({
  createAxiosWithLoginRedirect: mocks.createAxiosWithLoginRedirect,
}));

vi.mock("../auth", () => ({
  authProvider: {
    login: mocks.login,
  },
}));

import {
  cancelTasks,
  clearHistory,
  moveTask,
  patchQueueState,
  submitQueueTasks,
  useGetAllTasks,
  useGetHistoricTasks,
  useGetQueueHealth,
  useGetQueueState,
  useGetQueuedTasks,
} from "./queueService";

const mockQueueState = { paused: true };
const mockTasks = [] as never[];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        refetchInterval: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper(queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.get.mockImplementation(async (url: string) => {
    switch (url) {
      case "/healthz":
        return { data: {} };

      case "/queue/state":
        return { data: mockQueueState };

      case "/queue":
      case "/tasks":
      case "/history":
        return { data: mockTasks };

      default:
        throw new Error(`Unexpected GET request: ${url}`);
    }
  });

  mocks.patch.mockResolvedValue({ data: mockQueueState });
  mocks.post.mockResolvedValue({ data: 1 });
  mocks.delete.mockResolvedValue({ data: mockTasks });
});

describe("Queue HTTP requests", () => {
  describe("GET requests", () => {
    const cases = [
      ["queue health", useGetQueueHealth, "/healthz"],
      ["queue state", useGetQueueState, "/queue/state"],
      ["queued tasks", useGetQueuedTasks, "/queue"],
      ["all tasks", useGetAllTasks, "/tasks"],
      ["historic tasks", useGetHistoricTasks, "/history"],
    ] as const;

    it.each(cases)("gets %s from %s", async (_, hook, url) => {
      const { result } = renderHook(() => hook(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mocks.get).toHaveBeenCalledExactlyOnceWith(url);
    });
  });

  describe("PATCH requests", () => {
    it("updates queue state at /queue/state", async () => {
      await patchQueueState(false);

      expect(mocks.patch).toHaveBeenCalledExactlyOnceWith("/queue/state", {
        paused: false,
      });
    });
  });

  describe("DELETE requests", () => {
    it("cancels tasks at /queue/tasks", async () => {
      const taskIds = ["task-1", "task-2"];

      await cancelTasks(taskIds);

      expect(mocks.delete).toHaveBeenCalledExactlyOnceWith("/queue/tasks", {
        data: { task_ids: taskIds },
      });
    });

    it("clears history at /history", async () => {
      await clearHistory();

      expect(mocks.delete).toHaveBeenCalledExactlyOnceWith("/history");
    });
  });

  describe("POST requests", () => {
    it("moves a task at /queue/move", async () => {
      await moveTask({
        taskId: "task-123",
        newPosition: 3,
      });

      expect(mocks.post).toHaveBeenCalledExactlyOnceWith("/queue/move", null, {
        params: {
          task_id: "task-123",
          new_position: 3,
        },
      });
    });

    it("submits tasks at /queue with a position", async () => {
      const experiments = [{ name: "test experiment" }] as never;

      await submitQueueTasks({
        experiments,
        taskPosition: 2,
      });

      expect(mocks.post).toHaveBeenCalledExactlyOnceWith(
        "/queue",
        experiments,
        {
          params: { position: 2 },
        },
      );
    });

    it("submits tasks without a position", async () => {
      const experiments = [{ name: "test experiment" }] as never;

      await submitQueueTasks({ experiments });

      expect(mocks.post).toHaveBeenCalledExactlyOnceWith(
        "/queue",
        experiments,
        {
          params: { position: undefined },
        },
      );
    });
  });
});
