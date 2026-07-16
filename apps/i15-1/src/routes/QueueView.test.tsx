import { render, screen, fireEvent } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  BlueapiCallResponse,
  TaskWithPosition,
} from "../../generated/queue";

type MockRow = {
  id: string;
  sampleId: string;
  instrumentSession: string;
  blueapi_calls: BlueapiCallResponse[];
};

type MockTableOptions = {
  data: MockRow[];
  renderTopToolbarCustomActions?: () => React.ReactNode;
  renderDetailPanel?: (props: {
    row: { original: MockRow };
  }) => React.ReactNode;
};

type MockTable = {
  options: MockTableOptions;
};

vi.mock("material-react-table", () => ({
  MaterialReactTable: ({ table }: { table: MockTable }) => (
    <div>
      <div data-testid="mock-table">
        {table.options.data.map((row: MockRow) => (
          <div key={row.id}>
            {row.instrumentSession}
            {table.options.renderDetailPanel?.({
              row: { original: row },
            })}
          </div>
        ))}
      </div>

      {table.options.renderTopToolbarCustomActions?.()}
    </div>
  ),
  useMaterialReactTable: (opts: MockTableOptions) => ({
    options: opts,
    getState: () => ({}),
  }),
}));

vi.mock("../queue/QueueStatusPanel", () => ({
  QueueStatusPanel: () => <div>QueueStatusPanel</div>,
}));

vi.mock("../queue/PlanStatusPanel", () => ({
  PlanStatusPanel: () => <div>PlanStatusPanel</div>,
}));

vi.mock("../components/JsonView", () => ({
  JsonView: () => <div>JsonView</div>,
}));

describe("QueueView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(queueService, "useQueueEvents").mockImplementation(() => {});

    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [
        {
          id: "1",
          position: 0,
          status: "Queued",
          experiment: {
            name: "Exp 1",
            instrument_session: "session2",
            sample: { id: "sample2", name: "my_sample", data: {} },
            experiment_definition: {
              name: "PlanB",
              id: "123",
              data: { time: 1 },
            },
          },
          blueapi_calls: [
            {
              parent_task_id: "1",
              status: "Waiting",
              result: null,
              errors: [],
              time_started: null,
              time_completed: null,
              task_request: { name: "sleep", instrument_session: "session2" },
              blueapi_id: "1",
            },
          ],
          kind: "Experiment",
        },
      ],
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    vi.spyOn(queueService, "useGetAllTasks").mockReturnValue({
      data: [
        {
          id: "0",
          position: null,
          status: "Complete",
          experiment: {
            instrument_session: "session1",
            name: "planA",
            params: { time: 1 },
          },
          blueapi_calls: [
            {
              parent_task_id: "0",
              status: "Success",
              result: {
                outcome: "success",
                result: null,
                type: "NoneType",
              },
              errors: [],
              time_started: "2026-07-06T10:23:45.045920",
              time_completed: "2026-07-06T10:23:55.100463",
              task_request: { name: "sleep", instrument_session: "session1" },
              blueapi_id: "0",
            },
          ],
          kind: "Plan",
        },
        {
          id: "1",
          position: 0,
          status: "Queued",
          experiment: {
            name: "exp_2",
            instrument_session: "session2",
            sample: { id: "sample2", name: "my_sample", data: {} },
            experiment_definition: {
              name: "planB",
              id: "123",
              data: { time: 1 },
            },
          },
          blueapi_calls: [
            {
              parent_task_id: "1",
              status: "Waiting",
              result: null,
              errors: [],
              time_started: null,
              time_completed: null,
              task_request: { name: "sleep", instrument_session: "session2" },
              blueapi_id: "1",
            },
          ],
          kind: "Experiment",
        },
      ],
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue({
      data: [
        {
          id: "0",
          position: null,
          status: "Complete",
          experiment: {
            name: "exp_1",
            instrument_session: "session1",
            sample: { id: "sample1", name: "my_sample", data: {} },
            experiment_definition: {
              name: "planA",
              id: "123",
              data: { time: 1 },
            },
          },
          blueapi_calls: [],
          kind: "Experiment",
        },
      ],
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    vi.spyOn(queueService, "useMoveTask").mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof queueService.useMoveTask>);

    vi.spyOn(queueService, "clearHistory").mockImplementation(vi.fn());
    vi.spyOn(queueService, "cancelTasks").mockImplementation(vi.fn());
  });

  it("renders queue if Show historic tasks is off", () => {
    render(<QueueView />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.queryByText("session1")).not.toBeInTheDocument();
    expect(screen.getByText("session2")).toBeInTheDocument();
  });

  it("renders queue and last error if Show historic tasks is off", () => {
    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue({
      data: [
        {
          id: "0",
          position: null,
          status: "Error",
          experiment: {
            name: "exp_1",
            instrument_session: "session1",
            sample: { id: "sample1", name: "my_sample", data: {} },
            experiment_definition: {
              name: "planA",
              id: "123",
              data: { time: 1 },
            },
          },
          blueapi_calls: [],
          kind: "Experiment",
        },
      ],
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    render(<QueueView />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("session1")).toBeInTheDocument();
    expect(screen.getByText("session2")).toBeInTheDocument();
  });

  it("renders all tasks if Show historic tasks is on", () => {
    render(<QueueView />);

    const showHistory = screen.getByLabelText(/Show historic tasks/);
    fireEvent.click(showHistory);

    expect(showHistory).toBeChecked();
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("session1")).toBeInTheDocument();
    expect(screen.getByText("session2")).toBeInTheDocument();
  });

  it("shows QueueStatusPanel", () => {
    render(<QueueView />);
    expect(screen.getByText("QueueStatusPanel")).toBeInTheDocument();
  });

  it("toggles historic tasks switch", () => {
    render(<QueueView />);

    const showHistory = screen.getByLabelText(/Show historic tasks/);
    expect(showHistory).not.toBeChecked();
    fireEvent.click(showHistory);

    expect(showHistory).toBeChecked();
  });

  it("enables Clear History when show historic tasks is enabled", () => {
    render(<QueueView />);

    const showHistory = screen.getByLabelText(/Show historic tasks/);
    const button = screen.getByRole("button", {
      name: /clear history/i,
    });

    expect(button).toBeDisabled();

    fireEvent.click(showHistory);

    expect(button).toBeEnabled();
  });

  it("calls clearHistory when clicked", () => {
    render(<QueueView />);

    const clearSpy = vi.spyOn(queueService, "clearHistory");
    const showHistory = screen.getByLabelText(/Show historic tasks/);
    fireEvent.click(showHistory);

    const button = screen.getByRole("button", {
      name: /clear history/i,
    });

    fireEvent.click(button);

    expect(clearSpy).toHaveBeenCalled();
  });

  it("renders PlanStatusPanel for Experiment tasks", () => {
    render(<QueueView />);

    expect(screen.getByText("PlanStatusPanel")).toBeInTheDocument();
    expect(screen.queryByText("JsonView")).not.toBeInTheDocument();
  });

  it("renders JsonView for Plan tasks", () => {
    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [
        {
          id: "1",
          position: 0,
          status: "Queued",
          experiment: {
            instrument_session: "session1",
            name: "planA",
            params: {},
          },
          blueapi_calls: [
            {
              task_request: { name: "Plan A" },
            },
          ],
          kind: "Plan",
        },
      ],
    } as UseQueryResult<TaskWithPosition[], Error>);

    render(<QueueView />);

    expect(screen.queryByText("PlanStatusPanel")).not.toBeInTheDocument();
    expect(screen.getByText("JsonView")).toBeInTheDocument();
  });
});
