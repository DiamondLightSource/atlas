import type { TaskRequest } from "@atlas/blueapi";
import { PlanBrowser } from "@atlas/blueapi-ui";
import { useSumbitQueueTasks } from "../queue/queueService";

export default function Plans() {
  const { mutateAsync } = useSumbitQueueTasks();

  const addPlanToQueue = async (taskRequest: TaskRequest) => {
    await mutateAsync({ experiments: [taskRequest] });
  };

  return <PlanBrowser onQueuePlan={addPlanToQueue} />;
}
