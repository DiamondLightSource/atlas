import type { WorkerState } from "@atlas/blueapi";
import { useGetWorkerState } from "@atlas/blueapi-query";
import { DataCard } from "@diamondlightsource/sci-react-ui";

function getColour(state: WorkerState) {
  switch (state) {
    case "IDLE":
      return "success";
    case "RUNNING":
      return "info";
    case "PAUSING":
    case "PAUSED":
    case "HALTING":
      return "warning";
    case "STOPPING":
    case "ABORTING":
    case "SUSPENDING":
    case "PANICKED":
      return "danger";
    case "UNKNOWN":
    default:
      return "neutral";
  }
}

function normaliseCase(state: WorkerState) {
  return state.charAt(0).toUpperCase() + state.substring(1).toLowerCase();
}

export function BlueapiWorkerState() {
  const workerState = useGetWorkerState();
  const state = workerState.data ?? "UNKNOWN";

  return (
    <DataCard
      title="Blueapi worker"
      value={{ value: normaliseCase(state) }}
      colour={getColour(state)}
    />
  );
}
