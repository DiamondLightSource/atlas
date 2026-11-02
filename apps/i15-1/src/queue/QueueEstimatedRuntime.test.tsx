import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToggleQueueState } from "./queueService";
import { formatDuration, QueueEstimatedRuntime } from "./QueueEstimatedRuntime";
import { cleanup, render, screen } from "@atlas/vitest-conf";

vi.mock("./queueService", () => ({ useToggleQueueState: vi.fn() }));

const mockedUseToggleQueueState = vi.mocked(useToggleQueueState);

describe("formatDuration", () => {
  describe("seconds", () => {
    it("formats zero seconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("formats seconds less than a minute", () => {
      expect(formatDuration(30)).toBe("30s");
    });

    it("formats the maximum number of seconds before a minute", () => {
      expect(formatDuration(59)).toBe("59s");
    });
  });

  describe("minutes", () => {
    it("formats exactly one minute", () => {
      expect(formatDuration(60)).toBe("1m 0s");
    });

    it("formats minutes and seconds", () => {
      expect(formatDuration(90)).toBe("1m 30s");
    });

    it("formats multiple minutes", () => {
      expect(formatDuration(300)).toBe("5m 0s");
    });

    it("formats the maximum duration before an hour", () => {
      expect(formatDuration(3599)).toBe("59m 59s");
    });
  });

  describe("hours", () => {
    it("formats exactly one hour", () => {
      expect(formatDuration(3600)).toBe("1h 0m 0s");
    });

    it("formats hours, minutes and seconds", () => {
      expect(formatDuration(3665)).toBe("1h 1m 5s");
    });

    it("formats multiple hours", () => {
      expect(formatDuration(7200)).toBe("2h 0m 0s");
    });

    it("formats large durations", () => {
      expect(formatDuration(90061)).toBe("25h 1m 1s");
    });
  });

  describe("fractional seconds", () => {
    it("rounds down fractional seconds", () => {
      expect(formatDuration(30.9)).toBe("30s");
    });

    it("rounds down fractional minutes and seconds", () => {
      expect(formatDuration(90.9)).toBe("1m 30s");
    });
  });
});

describe("QueueEstimatedRuntime", () => {
  beforeEach(() => {
    mockedUseToggleQueueState.mockReturnValue({
      queueState: { estimated_runtime: 90 },
    } as ReturnType<typeof useToggleQueueState>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the estimated runtime", () => {
    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: 1m 30s")).toBeInTheDocument();
  });

  it("renders the default label", () => {
    render(<QueueEstimatedRuntime />);

    expect(screen.getByText(/^Estimated Runtime:/)).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<QueueEstimatedRuntime label="Time remaining:" />);

    expect(screen.getByText("Time remaining: 1m 30s")).toBeInTheDocument();
  });

  it("renders Unknown when queueState is undefined", () => {
    mockedUseToggleQueueState.mockReturnValue({
      queueState: undefined,
    } as ReturnType<typeof useToggleQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders Unknown when estimated_runtime is undefined", () => {
    mockedUseToggleQueueState.mockReturnValue({ queueState: {} } as ReturnType<
      typeof useToggleQueueState
    >);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders Unknown when estimated_runtime is null", () => {
    mockedUseToggleQueueState.mockReturnValue({
      queueState: { estimated_runtime: null },
    } as unknown as ReturnType<typeof useToggleQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it.each([
    ["negative runtime", -10],
    ["NaN", NaN],
    ["positive Infinity", Infinity],
    ["negative Infinity", -Infinity],
  ])("renders Unknown for %s", (_description, runtime) => {
    mockedUseToggleQueueState.mockReturnValue({
      queueState: { estimated_runtime: runtime },
    } as ReturnType<typeof useToggleQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: Unknown")).toBeInTheDocument();
  });

  it("renders zero as a valid runtime", () => {
    mockedUseToggleQueueState.mockReturnValue({
      queueState: { estimated_runtime: 0 },
    } as ReturnType<typeof useToggleQueueState>);

    render(<QueueEstimatedRuntime />);

    expect(screen.getByText("Estimated Runtime: 0s")).toBeInTheDocument();
  });

  it("forwards Typography props", () => {
    render(
      <QueueEstimatedRuntime
        label="Runtime:"
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
});
