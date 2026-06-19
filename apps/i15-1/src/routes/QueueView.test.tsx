import { render, screen, fireEvent } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { UseQueryResult } from "@tanstack/react-query";
import type { QueuedTasks } from "../queue/tasks";

type MockRow = {
  id: string;
  sampleId: string;
};

type MockTableOptions = {
  data: MockRow[];
  renderTopToolbarCustomActions?: () => React.ReactNode;
};

type MockTable = {
  options: MockTableOptions;
};

vi.mock("material-react-table", () => ({
  MaterialReactTable: ({ table }: { table: MockTable }) => (
    <div>
      <div data-testid="mock-table">
        {table.options.data.map((row: MockRow) => (
          <div key={row.id}>{row.sampleId}</div>
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
          experiment_definition: {
            instrument_session: "session2",
            sample_id: "sample2",
            plan_name: "planB",
            params: { time: 1 },
          },
          blueapi_calls: [],
        },
      ],
    } as Partial<UseQueryResult<QueuedTasks, Error>> as UseQueryResult<
      QueuedTasks,
      Error
    >);

    vi.spyOn(queueService, "useGetAllTasks").mockReturnValue({
      data: [
        {
          id: "0",
          position: null,
          status: "Complete",
          experiment_definition: {
            instrument_session: "session1",
            sample_id: "sample1",
            plan_name: "planA",
            params: { time: 1 },
          },
          blueapi_calls: [],
        },
        {
          id: "1",
          position: 0,
          status: "Queued",
          experiment_definition: {
            instrument_session: "session2",
            sample_id: "sample2",
            plan_name: "planB",
            params: { time: 1 },
          },
          blueapi_calls: [],
        },
      ],
    } as Partial<UseQueryResult<QueuedTasks, Error>> as UseQueryResult<
      QueuedTasks,
      Error
    >);

    vi.spyOn(queueService, "useMoveTask").mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof queueService.useMoveTask>);

    vi.spyOn(queueService, "clearHistory").mockImplementation(vi.fn());
    vi.spyOn(queueService, "cancelTasks").mockImplementation(vi.fn());
  });

  it("renders just queue data if Show historic tasks is off", () => {
    render(<QueueView />);

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.queryByText("sample1")).not.toBeInTheDocument();
    expect(screen.getByText("sample2")).toBeInTheDocument();
  });

  it("renders all tasks if Show historic tasks is on", () => {
    render(<QueueView />);

    const showHistory = screen.getByLabelText(/Show historic tasks/);
    fireEvent.click(showHistory);

    expect(showHistory).toBeChecked();
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("sample1")).toBeInTheDocument();
    expect(screen.getByText("sample2")).toBeInTheDocument();
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
});
