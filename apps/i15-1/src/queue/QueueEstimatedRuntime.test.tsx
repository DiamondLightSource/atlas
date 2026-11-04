import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, userEvent } from "@atlas/vitest-conf";

import { useGetQueueState } from "./queueService";
import { QueueEstimatedRuntime } from "./QueueEstimatedRuntime";

vi.mock("./queueService", () => ({
  useGetQueueState: vi.fn(),
}));

const mockedUseGetQueueState = vi.mocked(useGetQueueState);

function mockRuntime(runtime: number | null | undefined) {
  mockedUseGetQueueState.mockReturnValue({
    data:
      runtime === undefined
        ? undefined
        : {
            estimated_runtime: runtime,
          },
  } as ReturnType<typeof useGetQueueState>);
}

describe("QueueEstimatedRuntime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T10:00:00Z"));

    mockRuntime(90);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders the estimated runtime", () => {
    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: 1m 30s")).toBeInTheDocument();
  });

  it("renders the default label", () => {
    render(<QueueEstimatedRuntime />);

    expect(screen.getByText(/^Estimated Runtime:/)).toBeInTheDocument();
  });

  it("renders a custom runtime label", () => {
    render(<QueueEstimatedRuntime runtimeLabel="Time remaining:" />);

    expect(screen.getByText("Time remaining: 1m 30s")).toBeInTheDocument();
  });

  it("renders Unknown when queue state is undefined", () => {
    mockedUseGetQueueState.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useGetQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders Unknown when estimated_runtime is undefined", () => {
    mockedUseGetQueueState.mockReturnValue({
      data: {},
    } as ReturnType<typeof useGetQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders Unknown when estimated_runtime is null", () => {
    mockRuntime(null);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it.each([
    ["negative runtime", -10],
    ["NaN", NaN],
    ["positive Infinity", Infinity],
    ["negative Infinity", -Infinity],
  ])("renders Unknown for %s", (_description, runtime) => {
    mockRuntime(runtime);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders zero as a valid runtime", () => {
    mockRuntime(0);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: 0s")).toBeInTheDocument();
  });

  it("forwards Typography props", () => {
    render(
      <QueueEstimatedRuntime
        runtimeLabel="Runtime:"
        variant="body2"
        color="secondary"
        data-testid="queue-runtime"
      />,
    );

    const typography = screen.getByTestId("queue-runtime");

    expect(typography).toBeInTheDocument();
    expect(typography).toHaveTextContent("Runtime: 1m 30s");
    expect(typography.tagName.toLowerCase()).toBe("p");
  });

  it("allows custom sx props", () => {
    render(
      <QueueEstimatedRuntime
        data-testid="queue-runtime"
        sx={{ fontSize: 24 }}
      />,
    );

    expect(screen.getByTestId("queue-runtime")).toBeInTheDocument();
  });

  it("toggles to finish time when clicked", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(<QueueEstimatedRuntime />);

    await user.click(screen.getByText(/Estimated Runtime:/));

    expect(
      screen.getByText("Estimated Finish Time: 10:01:30"),
    ).toBeInTheDocument();
  });

  it("toggles back to runtime when clicked twice", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(<QueueEstimatedRuntime />);

    await user.click(screen.getByText(/Estimated Runtime:/));
    await user.click(screen.getByText(/Estimated Finish Time:/));

    expect(screen.getByText("Estimated Runtime: 1m 30s")).toBeInTheDocument();
  });

  it("shows the date when finish time is not today", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    mockRuntime(60 * 60 * 24);

    render(<QueueEstimatedRuntime />);

    await user.click(screen.getByText(/Estimated Runtime:/));

    expect(
      screen.getByText("Estimated Finish Time: 4 Nov, 10:00"),
    ).toBeInTheDocument();
  });

  it("uses a custom finish time label", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(<QueueEstimatedRuntime finishTimeLabel="Finishes at:" />);

    await user.click(screen.getByText(/Estimated Runtime:/));

    expect(screen.getByText(/^Finishes at:/)).toBeInTheDocument();
  });

  it("shows the current time as the finish time for a zero runtime", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    mockRuntime(0);
    render(<QueueEstimatedRuntime />);
    await user.click(screen.getByText(/Estimated Runtime:/));
    expect(
      screen.getByText("Estimated Finish Time: 10:00:00"),
    ).toBeInTheDocument();
  });

  it.each([[undefined], [null], [NaN], [Infinity], [-Infinity], [-1]])(
    "shows Unknown for invalid runtime %p",
    (runtime) => {
      mockRuntime(runtime as number | null | undefined);
      render(<QueueEstimatedRuntime />);
      expect(
        screen.getByText("Estimated Runtime: Unknown"),
      ).toBeInTheDocument();
    },
  );
});
