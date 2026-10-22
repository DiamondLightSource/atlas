import { useEffect, useRef, useState } from "react";
import type { TrackableTask } from "@atlas/blueapi";
import { useBlueapi, useGetWorkerState } from "@atlas/blueapi-query";
import { useScanEvents } from "./scanEvents";

/** Where the latest scan is, as far as the scan events and blueapi say */
export type ScanPhase = "running" | "complete" | "failed" | "aborted";

export interface ScanStatus {
  phase: ScanPhase;
  /** The scan's uuid, from the scan events */
  uuid: string;
  /** The blueapi plan that ran it, once known */
  planName?: string;
  /** The plan's `scan_type` parameter ("step" or "fly"), if it has one */
  scanType?: string;
  /** When this tab saw the scan start (ms since the epoch); unknown if the tab joined mid-scan */
  startedAt?: number;
  /** When this tab saw the scan end */
  endedAt?: number;
  /** Blueapi's error for a failed or aborted scan */
  error?: string;
}

/** Tries for blueapi to mark the task complete after the scan ends */
const TASK_SETTLE_ATTEMPTS = 10;
const TASK_SETTLE_DELAY_MS = 500;

/**
 * An error that reads as an abort. The UI aborts with the reason "UI
 * Intervention"; the worker passing through ABORTING is the other sign.
 */
const ABORT_PATTERN = /abort|UI Intervention/i;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** The plan and scan type a task ran */
function describeTask(
  task: TrackableTask,
): Pick<ScanStatus, "planName" | "scanType"> {
  const params = task.task.params as { scan_type?: unknown };
  return {
    planName: task.task.name,
    scanType:
      typeof params?.scan_type === "string" ? params.scan_type : undefined,
  };
}

/** The task's error, if it ended in one */
function taskError(task: TrackableTask): string | undefined {
  if (task.errors.length > 0) return task.errors[0];
  if (task.outcome?.outcome === "error") {
    return task.outcome.message ?? task.outcome.type ?? "Unknown error";
  }
  return undefined;
}

/**
 * The latest scan's status, for a status line: the scan events say when it
 * starts and ends, and blueapi's task says which plan ran it, its scan type,
 * and why it failed.
 */
export function useScanStatus(): ScanStatus | null {
  const blueapi = useBlueapi();
  const scanEvent = useScanEvents();
  const workerState = useGetWorkerState();
  const [status, setStatus] = useState<ScanStatus | null>(null);

  /** The scan the refs below belong to */
  const scanUuid = useRef<string | null>(null);
  /** Its blueapi task, once known */
  const taskId = useRef<string | null>(null);
  /** Whether the worker was seen aborting during it */
  const sawAbort = useRef(false);

  // An abort can be over before the task records why, so note it as it happens
  useEffect(() => {
    if (workerState.data === "ABORTING") sawAbort.current = true;
  }, [workerState.data]);

  useEffect(() => {
    if (!scanEvent) return;
    const { uuid } = scanEvent;

    /** Merge into the status, if it is still this scan's */
    const update = (changes: Partial<ScanStatus>) =>
      setStatus(current =>
        current?.uuid === uuid ? { ...current, ...changes } : current,
      );

    /** Find the running task, for its plan and scan type */
    async function identify() {
      try {
        const { task_id } = await blueapi.worker.getActiveTask();
        if (!task_id || scanUuid.current !== uuid) return;
        taskId.current = task_id;
        update(describeTask(await blueapi.tasks.get(task_id)));
      } catch (err) {
        console.warn("Couldn't identify the running task:", err);
      }
    }

    /** Once blueapi has finished the task, take its error, if any */
    async function settle(failedEvent: boolean) {
      const id = taskId.current;
      if (!id) return;
      try {
        for (let attempt = 0; attempt < TASK_SETTLE_ATTEMPTS; attempt++) {
          const task = await blueapi.tasks.get(id);
          if (task.is_complete) {
            const error = taskError(task);
            const aborted =
              sawAbort.current ||
              (error !== undefined && ABORT_PATTERN.test(error));
            update({
              ...describeTask(task),
              error,
              phase: aborted
                ? "aborted"
                : error !== undefined || failedEvent
                  ? "failed"
                  : "complete",
            });
            return;
          }
          await delay(TASK_SETTLE_DELAY_MS);
        }
      } catch (err) {
        console.warn("Couldn't fetch the finished task:", err);
      }
    }

    if (scanEvent.status === "running") {
      if (scanUuid.current === uuid) return; // the same scan, already shown
      scanUuid.current = uuid;
      taskId.current = null;
      sawAbort.current = workerState.data === "ABORTING";
      setStatus({ phase: "running", uuid, startedAt: Date.now() });
      void identify();
    } else {
      const failedEvent = scanEvent.status === "failed";
      if (scanUuid.current !== uuid) {
        // the tab joined mid-scan: no start time or task to go on
        scanUuid.current = uuid;
        taskId.current = null;
      }
      setStatus(current => ({
        ...(current?.uuid === uuid ? current : { uuid }),
        phase: failedEvent ? "failed" : "complete",
        endedAt: Date.now(),
      }));
      void settle(failedEvent);
    }
    // workerState is only read for the starting value of sawAbort
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanEvent, blueapi]);

  return status;
}
