import type { TaskRequest } from "@atlas/blueapi";
import { PlanBrowser } from "@atlas/blueapi-ui";
import type { TaskRequest as QueueTaskRequest } from "../../generated/queue";
import { useSumbitQueueTasks } from "../queue/queueService";

export default function Plans() {
  const { mutateAsync } = useSumbitQueueTasks();

  const addPlanToQueue = async (taskRequest: TaskRequest) => {
    await mutateAsync({ experiments: [taskRequest as QueueTaskRequest] });
  };

  return <PlanBrowser onQueuePlan={addPlanToQueue} />;
}
