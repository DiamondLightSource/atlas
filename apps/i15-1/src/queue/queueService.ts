import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios, { type AxiosInstance } from "axios";
import { useEffect, useRef } from "react";
import type {
  QueueState,
  TaskCancelRequest,
  AddTasksToQueueQueuePostData,
} from "../../generated/queue";
import { addTasksToQueueQueuePost } from "../../generated/queue";
import { client } from "../../generated/queue/client.gen";
import type { QueuedTasks } from "./tasks";

// This should be tidied up in https://github.com/DiamondLightSource/atlas/issues/59
const QUEUE_MODE = import.meta.env.VITE_QUEUE_MODE;
const QUEUE_SOCKET: string =
  QUEUE_MODE === "local" ? "http://127.0.0.1:8001" : "/api/daq-queue";

client.setConfig({ baseUrl: QUEUE_SOCKET });

const handlers = {
  state_update: "state",
  queue_update: "queue",
  history_update: "history",
  tasks_update: "tasks",
  call_queue_update: "call_queue",
  call_history_update: "call_history",
};

export function createQueueApiClient(baseURL: string): AxiosInstance {
  return axios.create({ baseURL });
}

export function useQueueEvents() {
  const queryClient = useQueryClient();
  const { connected } = useConnected();

  useEffect(() => {
    if (!connected) return;

    const source = new EventSource(QUEUE_SOCKET + "/events");

    Object.entries(handlers).forEach(([eventName, queryKey]) => {
      source.addEventListener(eventName, (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        queryClient.setQueryData([queryKey], () => structuredClone(data));
      });
    });

    source.onerror = (err) => {
      console.error("SSE error:", err);
    };
    source.onopen = (ev) => {
      console.log("Opened SSE connection", ev);
    };

    return () => {
      source.close();
    };
  }, [connected, queryClient]);
}

const getQueueHealth = async (): Promise<QueueState> => {
  const response = await axios.get<QueueState>(QUEUE_SOCKET + "/healthz");
  return response.data;
};

export function useGetQueueHealth() {
  return useQuery({
    queryKey: ["connected"],
    queryFn: getQueueHealth,
    staleTime: 0,
    refetchInterval: 500,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 300,
  });
}

export function useConnected() {
  const query = useGetQueueHealth();
  const queryClient = useQueryClient();
  const connected = query.status === "success";
  const wasConnected = useRef<boolean | null>(null);

  useEffect(() => {
    if (wasConnected.current === false && connected === true) {
      queryClient.resetQueries({
        predicate: (q) =>
          Object.values(handlers).includes(q.queryKey[0] as string),
      });
    }

    wasConnected.current = connected;
  }, [connected, queryClient]);

  return { connected, ...query };
}

const getQueueState = async (): Promise<QueueState> => {
  const response = await axios.get<QueueState>(QUEUE_SOCKET + "/queue/state");
  return response.data;
};

export function useGetQueueState() {
  return useQuery({
    queryKey: ["state"],
    queryFn: getQueueState,
    staleTime: Infinity,
    refetchInterval: false,
  });
}

export const patchQueueState = async (paused: boolean): Promise<QueueState> => {
  const response = await axios.patch<QueueState>(
    QUEUE_SOCKET + "/queue/state",
    { paused: paused },
  );
  return response.data;
};

export function usePatchQueueState() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: patchQueueState,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["state"] });
    },
  });
}

export function useToggleQueueState() {
  const { data } = useGetQueueState();
  const mutation = usePatchQueueState();

  const toggle = async () => {
    if (data == null) return;
    return mutation.mutateAsync(!data.paused);
  };

  return {
    paused: data?.paused ?? false,
    isLoading: mutation.isPending,
    toggle,
    isDisabled: mutation.isPending || data == null,
  };
}

const getQueuedTasks = async (): Promise<QueuedTasks> => {
  const response = await axios.get<QueuedTasks>(QUEUE_SOCKET + "/queue");
  return response.data;
};

export function useGetQueuedTasks() {
  return useQuery({
    queryKey: ["queue"],
    queryFn: getQueuedTasks,
    staleTime: Infinity,
    refetchInterval: false,
  });
}

const getAllTasks = async (): Promise<QueuedTasks> => {
  const response = await axios.get<QueuedTasks>(QUEUE_SOCKET + "/tasks");
  return response.data;
};

export function useGetAllTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
    staleTime: Infinity,
    refetchInterval: false,
  });
}

const getHistoricTasks = async (): Promise<QueuedTasks> => {
  const response = await axios.get<QueuedTasks>(QUEUE_SOCKET + "/history");
  return response.data;
};

export function useGetHistoricTasks() {
  return useQuery({
    queryKey: ["history"],
    queryFn: getHistoricTasks,
    staleTime: Infinity,
    refetchInterval: false,
  });
}

export const cancelTasks = async (taskIds: string[]): Promise<QueuedTasks> => {
  const response = await axios.delete<QueuedTasks>(
    QUEUE_SOCKET + "/queue/tasks",
    {
      data: {
        task_ids: taskIds,
      } as TaskCancelRequest,
    },
  );

  return response.data;
};

export function useCancelTasks() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: cancelTasks,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["queue", "tasks"] });
    },
  });
}

export const moveTask = async ({
  taskId,
  newPosition,
}: {
  taskId: string;
  newPosition: number;
}): Promise<number> => {
  const response = await axios.post<number>(
    QUEUE_SOCKET + "/queue/move",
    null,
    {
      params: {
        task_id: taskId,
        new_position: newPosition,
      },
    },
  );

  return response.data;
};

export function useMoveTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: moveTask,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["queue", "tasks"] });
    },
  });
}

export const clearHistory = async (): Promise<number> => {
  const response = await axios.delete<number>(QUEUE_SOCKET + "/history");

  return response.data;
};

export const submitTask = async ({
  taskPosition,
  taskParams,
}: {
  taskPosition: number;
  taskParams: Record<string, unknown>;
}) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sampleId = `test_1_${timestamp}`;

  const data: AddTasksToQueueQueuePostData = {
    url: `/queue`,
    body: [
      {
        plan_name: "run_full_collection",
        sample_id: sampleId,
        params: taskParams,
        instrument_session: "cm44163-3",
      },
    ],
    query: {
      position: taskPosition,
      // @ts-expect-error - validation is still a bit in flux,
      // see https://github.com/DiamondLightSource/daq-queuing-service/issues/42
      validate_with_blueapi: false,
    },
  };

  return await addTasksToQueueQueuePost(data);
};

export function useSumbitTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: submitTask,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["queue"] }),
        client.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
    },
  });
}
