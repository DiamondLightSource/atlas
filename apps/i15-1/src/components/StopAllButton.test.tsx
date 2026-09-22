import { describe, it, expect, vi, beforeEach } from "vitest";
import { StopAllButton } from "./StopAllButton";
import { fireEvent, render, screen, waitFor } from "@atlas/vitest-conf";

const pauseQueueMock = vi.fn();
const setStateMock = vi.fn();
const submitAndRunTaskMock = vi.fn();
const fetchSessionsMock = vi.fn();
const useInstrumentSessionMock = vi.fn();

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

vi.mock("../../../../packages/blueapi-ui/src/useSubmitAndRunTask", () => ({
  useSubmitAndRunTask: () => ({ submitAndRunTask: submitAndRunTaskMock }),
}));

vi.mock("@atlas/app-shell", () => ({
  useInstrumentSession: () => useInstrumentSessionMock(),
}));

vi.mock("@apollo/client/react", () => ({
  useLazyQuery: () => [fetchSessionsMock],
}));

vi.mock("../graphql/getInstrumentSessionsQuery.ts", () => ({
  getInstrumentSessionsQuery: {},
}));

const buildSessionsResponse = (refs: string[]) => ({
  data: {
    instrumentByKey: {
      instrumentSessions: {
        edges: refs.map((ref) => ({
          node: { instrumentSessionReference: ref },
        })),
      },
    },
  },
});

describe("StopAllButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInstrumentSessionMock.mockReturnValue({ instrumentSession: null });
    fetchSessionsMock.mockResolvedValue(buildSessionsResponse([]));
    submitAndRunTaskMock.mockResolvedValue({
      severity: "success",
      message: "Plan succeeded",
    });
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

  it("uses the currently selected instrument session without fetching sessions", async () => {
    useInstrumentSessionMock.mockReturnValue({
      instrumentSession: "cm11111-1",
    });

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    await waitFor(() => {
      expect(submitAndRunTaskMock).toHaveBeenCalledWith(
        {
          name: "move",
          instrument_session: "cm11111-1",
          params: { moves: { fast_shutter: "Close" } },
        },
        expect.any(Function),
      );
    });
    expect(fetchSessionsMock).not.toHaveBeenCalled();
  });

  it("fetches and uses any available session when none is selected", async () => {
    useInstrumentSessionMock.mockReturnValue({ instrumentSession: null });
    fetchSessionsMock.mockResolvedValue(
      buildSessionsResponse(["CM22222-2", "CM33333-3"]),
    );

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    await waitFor(() => {
      expect(submitAndRunTaskMock).toHaveBeenCalledWith(
        {
          name: "move",
          instrument_session: "cm22222-2",
          params: { moves: { fast_shutter: "Close" } },
        },
        expect.any(Function),
      );
    });
    expect(fetchSessionsMock).toHaveBeenCalledWith({
      variables: { instrumentKey: "I15-1" },
    });
  });

  it("still pauses the queue and aborts the worker even if no session can be found", async () => {
    useInstrumentSessionMock.mockReturnValue({ instrumentSession: null });
    fetchSessionsMock.mockResolvedValue(buildSessionsResponse([]));

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    expect(pauseQueueMock).toHaveBeenCalledTimes(1);
    expect(setStateMock).toHaveBeenCalledWith({
      new_state: "ABORTING",
      reason: "Abort button pressed in the UI",
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        "Queue paused and worker set to abort, but couldn't close the fast shutter: no instrument session available.",
      );
    });
    expect(submitAndRunTaskMock).not.toHaveBeenCalled();
  });

  it("still pauses the queue and aborts the worker even if the session fetch throws", async () => {
    useInstrumentSessionMock.mockReturnValue({ instrumentSession: null });
    fetchSessionsMock.mockRejectedValue(new Error("network error"));

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    expect(pauseQueueMock).toHaveBeenCalledTimes(1);
    expect(setStateMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        "Queue paused and worker set to abort, but couldn't close the fast shutter: no instrument session available.",
      );
    });
  });

  it("shows the interim then final success message when the shutter closes successfully", async () => {
    useInstrumentSessionMock.mockReturnValue({
      instrumentSession: "cm11111-1",
    });
    submitAndRunTaskMock.mockImplementation(async (_task, onSubmitted) => {
      onSubmitted?.({
        severity: "info",
        message: "Plan submission successful!",
      });
      return { severity: "success", message: "Plan succeeded" };
    });

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Plan submission successful!",
      );
    });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Plan succeeded");
    });
  });

  it("shows an error message when the task fails", async () => {
    useInstrumentSessionMock.mockReturnValue({
      instrumentSession: "cm11111-1",
    });
    submitAndRunTaskMock.mockRejectedValue(new Error("Some failure"));

    render(<StopAllButton />);
    fireEvent.click(screen.getByRole("button", { name: /stop all/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to abort, see console and blueapi logs for full error.",
      );
    });
  });
});
