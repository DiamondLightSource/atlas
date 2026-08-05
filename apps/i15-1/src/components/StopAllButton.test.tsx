import { describe, it, expect, vi, beforeEach } from "vitest";
import { StopAllButton } from "./StopAllButton";
import { fireEvent, render, screen } from "@atlas/vitest-conf";

const pauseQueueMock = vi.fn();
const setStateMock = vi.fn();

vi.mock("../queue/queueService", () => ({
  usePauseQueue: () => pauseQueueMock,
}));

vi.mock("@atlas/blueapi-query", () => ({
  useBlueapi: () => ({
    worker: {
      setState: setStateMock,
    },
  }),
}));

describe("StopAllButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the abort button", () => {
    render(<StopAllButton />);

    expect(
      screen.getByRole("button", { name: /stop all/i }),
    ).toBeInTheDocument();
  });

  it("pauses the queue when clicked", () => {
    render(<StopAllButton />);

    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    expect(pauseQueueMock).toHaveBeenCalledTimes(1);
  });

  it("sets the worker state to ABORTING when clicked", () => {
    render(<StopAllButton />);

    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    expect(setStateMock).toHaveBeenCalledWith({
      new_state: "ABORTING",
      reason: "Abort button pressed in the UI",
    });
  });

  it("pauses the queue before aborting the worker", () => {
    render(<StopAllButton />);

    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    expect(pauseQueueMock.mock.invocationCallOrder[0]).toBeLessThan(
      setStateMock.mock.invocationCallOrder[0],
    );
  });
});
