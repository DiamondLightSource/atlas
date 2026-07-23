import type {
  Experiment,
  TaskRequest,
  TaskWithPosition,
} from "../../generated/queue";
import type { QueueTableData } from "./tableData";

export function calculateNewPosition(
  oldPosition: number, // Position in queue
  oldIndex: number, // Row index in table
  targetIndex: number,
): number {
  const newPosition = Math.max(oldPosition + (targetIndex - oldIndex), 0);

  return newPosition;
}

export function positionFromName(name: string): string {
  const parts = name.split("_");
  return "Puck " + parts[1] + " | Pin " + parts[2];
}

export function getTableData(
  tasksToDisplay: TaskWithPosition[],
): QueueTableData[] {
  return (
    tasksToDisplay.map((task) => {
      if (task.kind === "Experiment") {
        const exp = task.experiment as Experiment;

        return {
          task: task,
          position: task.position,
          name: exp.name,
          id: task.id,
          instrumentSession: task.experiment.instrument_session,
          sampleId: exp.sample.id,
          samplePosition: positionFromName(exp.sample.name),
          density: exp.sample.data.density as number,
          beamSize: exp.experiment_definition.data.focused_beam_size as number,
          timePerPDF: exp.experiment_definition.data.time_per_pdf as number,
          status: task.status,
        };
      } else {
        const plan = task.experiment as TaskRequest;

        return {
          task: task,
          position: task.position,
          name: plan.name,
          id: task.id,
          instrumentSession: task.experiment.instrument_session,
          sampleId: "",
          samplePosition: "",
          density: null,
          beamSize: null,
          timePerPDF: null,
          status: task.status,
        };
      }
    }) ?? []
  );
}
