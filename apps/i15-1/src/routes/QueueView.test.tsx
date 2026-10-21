import { render, screen, fireEvent } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  BlueapiCallResponse,
  TaskWithPosition,
} from "../../generated/queue";
import { useMaterialReactTable } from "material-react-table";

type MockRow = {
  id: string;
  sampleId: string;
  instrumentSession: string;
  blueapi_calls: BlueapiCallResponse[];
};

type MockTableOptions = {
  data: MockRow[];
  columns: {
    accessorKey?: string;
    header?: string;
  }[];
  enableRowDragging?: boolean;
  enableRowOrdering?: boolean;
  getRowId?: (originalRow: MockRow) => string;
  state?: {
    showSkeletons?: boolean;
    showAlertBanner?: boolean;
  };
  muiToolbarAlertBannerProps?: { children?: React.ReactNode };
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

      {table.options.state?.showSkeletons ? (
        <div className="MuiSkeleton-root" />
      ) : null}
      {table.options.muiToolbarAlertBannerProps?.children}
      {table.options.renderTopToolbarCustomActions?.()}
    </div>
  ),
  useMaterialReactTable: vi.fn((opts: MockTableOptions) => ({
    options: opts,
    getState: () => ({}),
  })),
}));

const mockedUseMaterialReactTable = vi.mocked(useMaterialReactTable);

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
          user: null,
          id: "1",
          position: 0,
          status: "Queued",
          experiment: {
            name: "Exp 1",
            instrument_session: "session2",
            sample: {
              id: "sample2",
              name: "my_sample",
              data: {},
              container: { positionInParent: { position: 1 }, id: "" },
              positionInContainer: { position: 1 },
            },
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
              tiled_ids: [],
              scan_ids: [],
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
          user: null,
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
              tiled_ids: [],
              scan_ids: [],
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
            sample: {
              id: "sample2",
              name: "my_sample",
              data: {},
              container: { positionInParent: { position: 1 }, id: "" },
              positionInContainer: { position: 1 },
            },
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
          user: null,
          id: "0",
          position: null,
          status: "Complete",
          experiment: {
            name: "exp_1",
            instrument_session: "session1",
            sample: {
              id: "sample1",
              name: "my_sample",
              data: {},
              container: { positionInParent: { position: 1 }, id: "" },
              positionInContainer: { position: 1 },
            },
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
          user: null,
          id: "0",
          position: null,
          status: "Error",
          experiment: {
            name: "exp_1",
            instrument_session: "session1",
            sample: {
              id: "sample1",
              name: "my_sample",
              data: {},
              container: { positionInParent: { position: 1 }, id: "" },
              positionInContainer: { position: 1 },
            },
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

  it("renders queued tasks in future mode", () => {
    render(<QueueView displayMode="future" />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("session2")).toBeInTheDocument();
    expect(screen.queryByText("session1")).not.toBeInTheDocument();
  });

  it("renders all tasks in all mode", () => {
    render(<QueueView displayMode="all" />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("session1")).toBeInTheDocument();
    expect(screen.getByText("session2")).toBeInTheDocument();
  });

  it("renders historic tasks in historic mode", () => {
    render(<QueueView displayMode="historic" />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("session1")).toBeInTheDocument();
    expect(screen.queryByText("session2")).not.toBeInTheDocument();
  });

  it("shows QueueStatusPanel", () => {
    render(<QueueView />);
    expect(screen.getByText("QueueStatusPanel")).toBeInTheDocument();
  });

  it("enables Clear History when historic tasks visible", () => {
    const { rerender } = render(<QueueView displayMode="all" />);
    const button = screen.getByRole("button", {
      name: /clear history/i,
    });

    expect(button).toBeEnabled();

    rerender(<QueueView displayMode="future" />);
    expect(button).toBeDisabled();

    rerender(<QueueView displayMode="historic" />);
    expect(button).toBeEnabled();
  });

  it("calls clearHistory when clicked", () => {
    render(<QueueView displayMode="all" />);

    const clearSpy = vi.spyOn(queueService, "clearHistory");
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

  it("shows skeletons while historic tasks are pending", () => {
    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue({
      data: undefined,
      isPending: true,
      error: null,
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    const { container } = render(<QueueView displayMode="historic" />);

    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  it("gates skeletons on the all-tasks query when showing historic", () => {
    vi.spyOn(queueService, "useGetAllTasks").mockReturnValue({
      data: undefined,
      isPending: true,
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);
    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [],
      isPending: false,
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);
    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue({
      data: [],
      isPending: false,
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    const { container, rerender } = render(<QueueView displayMode="future" />);
    expect(
      container.querySelector(".MuiSkeleton-root"),
    ).not.toBeInTheDocument();

    rerender(<QueueView displayMode="all" />);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  it("shows an error banner when a query fails", () => {
    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: undefined,
      isPending: false,
      error: new Error("boom"),
    } as Partial<UseQueryResult<TaskWithPosition[], Error>> as UseQueryResult<
      TaskWithPosition[],
      Error
    >);

    render(<QueueView />);

    expect(screen.getByText("Error: boom")).toBeInTheDocument();
  });
});

describe("QueueView column visibility", () => {
  beforeEach(() => {
    mockedUseMaterialReactTable.mockClear();
  });

  it("shows position and cancel in all mode but hides them in historic mode", () => {
    const { rerender } = render(<QueueView displayMode="all" />);

    const getLatestOptions = () =>
      mockedUseMaterialReactTable.mock.calls.at(-1)?.[0];

    expect(
      getLatestOptions()?.columns.map((column) => column.accessorKey),
    ).toContain("position");

    expect(
      getLatestOptions()?.columns.map((column) => column.accessorKey),
    ).toContain("cancel");

    expect(getLatestOptions()?.enableRowDragging).toBe(true);
    expect(getLatestOptions()?.enableRowOrdering).toBe(true);

    rerender(<QueueView displayMode="historic" />);

    expect(
      getLatestOptions()?.columns.map((column) => column.accessorKey),
    ).not.toContain("position");

    expect(
      getLatestOptions()?.columns.map((column) => column.accessorKey),
    ).not.toContain("cancel");

    expect(getLatestOptions()?.enableRowDragging).toBe(false);
    expect(getLatestOptions()?.enableRowOrdering).toBe(false);
  });
});
