import {
  useBlueapi,
  useSetActiveTask,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { TaskRequest } from "@atlas/blueapi";

export type SeverityLevel = "success" | "info" | "warning" | "error";

export type RunResult = {
  severity: SeverityLevel;
  message: string;
};

const idleState = "IDLE";
const abortState = "ABORTING";

const waitForIdle = (timeoutInMs: number): Promise<void> =>
  new Promise((res) => setTimeout(res, timeoutInMs));

export function useSubmitAndRunTask() {
  const blueapi = useBlueapi();
  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();

  const runTask = async (task_id: string): Promise<RunResult> => {
    const started = await startTask.mutateAsync(task_id);
    if (!started) {
      throw new Error("Task couldn't be started");
    }

    let status = await blueapi.worker.getState();
    while (status !== idleState && status !== abortState) {
      await waitForIdle(100);
      status = await blueapi.worker.getState();
    }

    const data = await blueapi.tasks.get(task_id);
    if (data.is_complete) {
      if (data.outcome?.outcome === "success") {
        return { severity: "success", message: "Plan succeeded" };
      }
      if (data.outcome?.outcome === "error") {
        throw new Error(`${data.errors[0]}`);
      }
    }
    return { severity: "info", message: "Plan finished" };
  };

  const submitAndRunTask = async (
    task: TaskRequest,
    onSubmitted?: (result: RunResult) => void,
  ): Promise<RunResult> => {
    const response = await submitTask.mutateAsync(task);
    if (!response) {
      throw new Error("SUBMISSION_FAILED");
    }
    onSubmitted?.({ severity: "info", message: "Plan submission successful!" });
    return runTask(response.task_id);
  };

  return { submitAndRunTask };
}
