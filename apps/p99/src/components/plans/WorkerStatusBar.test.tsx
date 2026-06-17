import { render, screen, waitFor } from "@atlas/vitest-conf";
import { WorkerStatusBar } from "./WorkerStatusBar";

describe("WorkerStatusBar", () => {
  const mockOnSync = vi.fn();
  const mockOnSessionChange = vi.fn();

  it("renders the title and subtitle", () => {
    render(
      <WorkerStatusBar
        workerState="IDLE"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText("P99 Control")).toBeInTheDocument();
    expect(screen.getByText("Beamline Plan Library")).toBeInTheDocument();
  });

  it("displays worker state as IDLE", () => {
    render(
      <WorkerStatusBar
        workerState="IDLE"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: IDLE/)).toBeInTheDocument();
  });

  it("displays worker state as RUNNING", () => {
    render(
      <WorkerStatusBar
        workerState="RUNNING"
        activeTaskId="task-123"
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: RUNNING/)).toBeInTheDocument();
    expect(screen.getByText(/ID: task-/)).toBeInTheDocument();
  });

  it("displays worker state as PAUSED", () => {
    render(
      <WorkerStatusBar
        workerState="PAUSED"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: PAUSED/)).toBeInTheDocument();
  });

  it("displays PANICKED state", () => {
    render(
      <WorkerStatusBar
        workerState="PANICKED"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: PANICKED/)).toBeInTheDocument();
  });

  it("displays ABORTING state", () => {
    render(
      <WorkerStatusBar
        workerState="ABORTING"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: ABORTING/)).toBeInTheDocument();
  });

  it("renders sync button", () => {
    render(
      <WorkerStatusBar
        workerState="IDLE"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    const syncButton = screen.getByRole("button", { name: /sync/i });
    expect(syncButton).toBeInTheDocument();
  });

  it("disables sync button when fetching", () => {
    render(
      <WorkerStatusBar
        workerState="IDLE"
        activeTaskId={null}
        isFetching={true}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    const syncButton = screen.getByRole("button", { name: /sync/i });
    expect(syncButton).toBeDisabled();
  });

  it("calls onSync when sync button is clicked", async () => {
    render(
      <WorkerStatusBar
        workerState="IDLE"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    const syncButton = screen.getByRole("button", { name: /sync/i });
    syncButton.click();

    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalled();
    });
  });

  it("displays UNKNOWN state", () => {
    render(
      <WorkerStatusBar
        workerState="UNKNOWN"
        activeTaskId={null}
        isFetching={false}
        onSync={mockOnSync}
        instrumentSession="p99-session-01"
        onInstrumentSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByText(/STATE: UNKNOWN/)).toBeInTheDocument();
  });
});
