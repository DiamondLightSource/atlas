import { useEffect, useRef, useState } from "react";
import type { Api, TrackableTask, WorkerState } from "@atlas/blueapi";
import { useBlueapi, useGetWorkerState } from "@atlas/blueapi-query";
import { useScanEvents } from "./scanEvents";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// "ending": over, waiting on blueapi for how. "finished": over, but blueapi
// never said how
export type ScanPhase =
  | "running"
  | "ending"
  | "complete"
  | "finished"
  | "failed"
  | "aborted";

// The latest scan (from the scan events), or the plan the worker is running
// outside a scan: before, between or after scans, or with none at all
export interface ScanStatus {
  source: "scan" | "plan";
  phase: ScanPhase;
  id: string;
  planName?: string;
  scanType?: string;
  // unknown if this tab joined partway
  startedAt?: number;
  endedAt?: number;
  // when this tab first saw it, for telling which came last
  seenAt: number;
  error?: string;
  // when not plain RUNNING
  workerState?: WorkerState;
}

export type WorkerReach = "loading" | "ok" | "unreachable";

type TaskInfo = Pick<ScanStatus, "planName" | "scanType">;
type TaskResult = TaskInfo & Pick<ScanStatus, "phase" | "error">;

// unknown counts as not busy
export const isBusy = (state: WorkerState | undefined) =>
  state !== undefined && state !== "IDLE" && state !== "UNKNOWN";

// ---------------------------------------------------------------------------
// Blueapi tasks
// ---------------------------------------------------------------------------

// tries for blueapi to mark a task complete once it ends
const TASK_SETTLE_ATTEMPTS = 10;
const TASK_SETTLE_DELAY_MS = 500;

// the UI aborts with the reason "UI Intervention"
const ABORT_PATTERN = /abort|UI Intervention/i;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function describeTask(task: TrackableTask): TaskInfo {
  const params = task.task.params as { scan_type?: unknown };
  return {
    planName: task.task.name,
    scanType:
      typeof params?.scan_type === "string" ? params.scan_type : undefined,
  };
}

function taskError(task: TrackableTask): string | undefined {
  if (task.errors.length > 0) return task.errors[0];
  if (task.outcome?.outcome === "error") {
    return task.outcome.message ?? task.outcome.type ?? "Unknown error";
  }
  return undefined;
}

async function fetchActiveTask(
  blueapi: Api,
): Promise<{ taskId: string; info: TaskInfo } | null> {
  try {
    const { task_id } = await blueapi.worker.getActiveTask();
    if (!task_id) return null;
    return {
      taskId: task_id,
      info: describeTask(await blueapi.tasks.get(task_id)),
    };
  } catch (err) {
    console.warn("Couldn't identify the running task:", err);
    return null;
  }
}

// null if blueapi never finishes it
async function settleTask(
  blueapi: Api,
  taskId: string,
  sawAbort: boolean,
  failedEvent = false,
): Promise<TaskResult | null> {
  try {
    for (let attempt = 0; attempt < TASK_SETTLE_ATTEMPTS; attempt++) {
      const task = await blueapi.tasks.get(taskId);
      if (task.is_complete) {
        const error = taskError(task);
        const aborted =
          sawAbort || (error !== undefined && ABORT_PATTERN.test(error));
        return {
          ...describeTask(task),
          error,
          phase: aborted
            ? "aborted"
            : error !== undefined || failedEvent
              ? "failed"
              : "complete",
        };
      }
      await delay(TASK_SETTLE_DELAY_MS);
    }
  } catch (err) {
    console.warn("Couldn't fetch the finished task:", err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Latest scan, from the scan events
// ---------------------------------------------------------------------------

function useLatestScan(workerState: WorkerState | undefined) {
  const blueapi = useBlueapi();
  const scanEvent = useScanEvents();
  const [status, setStatus] = useState<ScanStatus | null>(null);

  // the current scan, its task, and whether the worker aborted during it
  const scanUuid = useRef<string | null>(null);
  const taskId = useRef<string | null>(null);
  const sawAbort = useRef(false);

  // an abort can be over before the task records why
  useEffect(() => {
    if (workerState === "ABORTING") sawAbort.current = true;
  }, [workerState]);

  useEffect(() => {
    if (!scanEvent) return;
    const { uuid } = scanEvent;

    const update = (changes: Partial<ScanStatus>) =>
      setStatus(current =>
        current?.id === uuid ? { ...current, ...changes } : current,
      );

    if (scanEvent.status === "running") {
      if (scanUuid.current === uuid) return; // already shown
      scanUuid.current = uuid;
      taskId.current = null;
      sawAbort.current = workerState === "ABORTING";
      const now = Date.now();
      setStatus({
        source: "scan",
        phase: "running",
        id: uuid,
        startedAt: now,
        seenAt: now,
      });
      void fetchActiveTask(blueapi).then(active => {
        if (!active || scanUuid.current !== uuid) return;
        taskId.current = active.taskId;
        update(active.info);
      });
    } else {
      const failedEvent = scanEvent.status === "failed";
      if (scanUuid.current !== uuid) {
        // joined mid-scan: no start time or task
        scanUuid.current = uuid;
        taskId.current = null;
      }
      setStatus(current => ({
        ...(current?.id === uuid
          ? current
          : { source: "scan" as const, id: uuid, seenAt: Date.now() }),
        phase: failedEvent ? "failed" : "complete",
        endedAt: Date.now(),
      }));
      const id = taskId.current;
      if (id) {
        void settleTask(blueapi, id, sawAbort.current, failedEvent).then(
          result => result && update(result),
        );
      }
    }
    // workerState only seeds sawAbort
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanEvent, blueapi]);

  return status;
}

// ---------------------------------------------------------------------------
// Latest plan run, from the worker state
// ---------------------------------------------------------------------------

function useLatestPlan(workerState: WorkerState | undefined) {
  const blueapi = useBlueapi();
  const [run, setRun] = useState<ScanStatus | null>(null);

  // the run in progress, its task lookup, and whether the worker aborted
  const runId = useRef<string | null>(null);
  const task = useRef<Promise<string | null> | null>(null);
  const sawAbort = useRef(false);
  // unknown before: the tab joined a busy worker, rather than saw it start
  const previous = useRef<WorkerState | undefined>(undefined);

  useEffect(() => {
    const before = previous.current;
    previous.current = workerState;
    if (workerState === undefined || workerState === "UNKNOWN") return;

    const update = (id: string, changes: Partial<ScanStatus>) =>
      setRun(current =>
        current?.id === id ? { ...current, ...changes } : current,
      );

    if (isBusy(workerState)) {
      if (workerState === "ABORTING") sawAbort.current = true;
      const shown = workerState === "RUNNING" ? undefined : workerState;
      if (runId.current) {
        update(runId.current, { workerState: shown });
        return;
      }
      const now = Date.now();
      const id = `plan-${now}`;
      runId.current = id;
      sawAbort.current = workerState === "ABORTING";
      setRun({
        source: "plan",
        phase: "running",
        id,
        startedAt: before === undefined ? undefined : now,
        seenAt: now,
        workerState: shown,
      });
      // kept, so the run's end can wait for it however late it is
      task.current = fetchActiveTask(blueapi).then(active => {
        if (!active) return null;
        update(id, active.info);
        return active.taskId;
      });
    } else if (runId.current) {
      const id = runId.current;
      const lookup = task.current;
      const aborted = sawAbort.current;
      runId.current = null;
      task.current = null;
      update(id, {
        phase: "ending",
        endedAt: Date.now(),
        workerState: undefined,
      });
      void (async () => {
        const taskId = await lookup;
        const result = taskId && (await settleTask(blueapi, taskId, aborted));
        update(id, result || { phase: aborted ? "aborted" : "finished" });
      })();
    }
  }, [workerState, blueapi]);

  return run;
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

// the scan or the plan, whichever says more
function choose(
  scan: ScanStatus | null,
  plan: ScanStatus | null,
): ScanStatus | null {
  if (plan?.phase === "running") {
    return scan?.phase === "running"
      ? { ...scan, workerState: plan.workerState }
      : plan;
  }
  if (!plan || !scan) return plan ?? scan;
  const scanEnded = scan.endedAt ?? Number.POSITIVE_INFINITY;
  // no scan during the plan
  if (scanEnded < plan.seenAt) return plan;
  // a plan that went wrong after its scan
  const planWentWrong = plan.phase === "failed" || plan.phase === "aborted";
  if (planWentWrong && (plan.endedAt ?? 0) >= scanEnded) return plan;
  return scan;
}

// While the worker is busy, the running scan, else the plan; once idle,
// whichever ended last
export function useScanStatus(): {
  status: ScanStatus | null;
  worker: WorkerReach;
} {
  const { data: workerState, isError } = useGetWorkerState();
  const scan = useLatestScan(workerState);
  const plan = useLatestPlan(workerState);
  return {
    status: choose(scan, plan),
    worker: isError ? "unreachable" : workerState ? "ok" : "loading",
  };
}
