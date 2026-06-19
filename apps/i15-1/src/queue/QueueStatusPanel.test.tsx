import { fireEvent, render, screen } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach } from "vitest";
import { QueueStatusPanel, QueueControlButton } from "./QueueStatusPanel";
import * as queueService from "./queueService";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QueueStatusPanel", () => {
  it("shows Queue Running when queue not paused and not empty", () => {
    vi.spyOn(queueService, "useConnected").mockReturnValue({
      connected: true,
    } as unknown as ReturnType<typeof queueService.useConnected>);

    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [{ id: 1 }],
    } as unknown as ReturnType<typeof queueService.useGetQueuedTasks>);

    vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
      paused: false,
    } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

    render(<QueueStatusPanel />);

    expect(screen.getByText(/Queue Running/i)).toBeInTheDocument();
  });

  it("shows Queue Finished when queue empty", () => {
    vi.spyOn(queueService, "useConnected").mockReturnValue({
      connected: true,
    } as unknown as ReturnType<typeof queueService.useConnected>);

    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof queueService.useGetQueuedTasks>);

    vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
      paused: false,
    } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

    render(<QueueStatusPanel />);

    expect(screen.getByText(/Queue Finished/i)).toBeInTheDocument();
  });

  it("shows Queue Paused when queue paused", () => {
    vi.spyOn(queueService, "useConnected").mockReturnValue({
      connected: true,
    } as unknown as ReturnType<typeof queueService.useConnected>);

    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [{ id: 1 }],
    } as unknown as ReturnType<typeof queueService.useGetQueuedTasks>);

    vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
      paused: true,
    } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

    render(<QueueStatusPanel />);

    expect(screen.getByText(/Queue Paused/i)).toBeInTheDocument();
  });

  it("shows Queue Not Connected when queue not connected", () => {
    vi.spyOn(queueService, "useConnected").mockReturnValue({
      connected: false,
    } as unknown as ReturnType<typeof queueService.useConnected>);

    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
      data: [{ id: 1 }],
    } as unknown as ReturnType<typeof queueService.useGetQueuedTasks>);

    vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
      paused: true,
    } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

    render(<QueueStatusPanel />);

    expect(screen.getByText(/Queue Not Connected/i)).toBeInTheDocument();
  });
});

describe("QueueControlButton", () => {
  it("calls toggle on click", () => {
    const toggle = vi.fn();

    vi.spyOn(queueService, "useConnected").mockReturnValue({
      connected: true,
    } as unknown as ReturnType<typeof queueService.useConnected>);

    vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
      paused: false,
      toggle,
      isLoading: false,
    } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

    render(<QueueControlButton />);
    fireEvent.click(screen.getByRole("button"));

    expect(toggle).toHaveBeenCalled();
  });
});
