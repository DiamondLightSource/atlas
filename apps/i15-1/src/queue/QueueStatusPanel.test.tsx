import { fireEvent, render, screen } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  QueueStatusPanel,
  QueueControlButton,
  SyncQueueButton,
} from "./QueueStatusPanel";
import * as queueService from "./queueService";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockQueueHooks({
  connected = true,
  paused = false,
  tasks = [{ id: 1 }],
  syncPending = false,
}: {
  connected?: boolean;
  paused?: boolean;
  tasks?: unknown[];
  syncPending?: boolean;
} = {}) {
  const toggle = vi.fn();
  const mutate = vi.fn();

  vi.spyOn(queueService, "useConnected").mockReturnValue({
    connected,
  } as unknown as ReturnType<typeof queueService.useConnected>);

  vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue({
    data: tasks,
  } as unknown as ReturnType<typeof queueService.useGetQueuedTasks>);

  vi.spyOn(queueService, "useToggleQueueState").mockReturnValue({
    queueState: { paused, estimated_runtime: null },
    toggle,
    isLoading: false,
  } as unknown as ReturnType<typeof queueService.useToggleQueueState>);

  vi.spyOn(queueService, "useSyncQueue").mockReturnValue({
    mutate,
    isPending: syncPending,
  } as unknown as ReturnType<typeof queueService.useSyncQueue>);

  return { toggle, mutate };
}

describe("QueueStatusPanel", () => {
  it("shows Queue Running when queue not paused and not empty", () => {
    mockQueueHooks();
    render(<QueueStatusPanel />);
    expect(screen.getByText(/Queue Running/i)).toBeInTheDocument();
  });

  it("shows Queue Finished when queue empty", () => {
    mockQueueHooks({ tasks: [] });
    render(<QueueStatusPanel />);
    expect(screen.getByText(/Queue Finished/i)).toBeInTheDocument();
  });

  it("shows Queue Paused when queue paused", () => {
    mockQueueHooks({ paused: true });
    render(<QueueStatusPanel />);
    expect(screen.getByText(/Queue Paused/i)).toBeInTheDocument();
  });

  it("shows Queue Not Connected when queue not connected", () => {
    mockQueueHooks({ connected: false, paused: true });
    render(<QueueStatusPanel />);
    expect(screen.getByText(/Queue Not Connected/i)).toBeInTheDocument();
  });

  it("renders the sync queue button", () => {
    mockQueueHooks();
    render(<QueueStatusPanel />);
    expect(
      screen.getByRole("button", { name: /sync queue/i }),
    ).toBeInTheDocument();
  });
});

describe("QueueControlButton", () => {
  it("calls toggle on click", () => {
    const { toggle } = mockQueueHooks();
    render(<QueueControlButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(toggle).toHaveBeenCalled();
  });
});

describe("SyncQueueButton", () => {
  it("calls the sync mutation on click", () => {
    const { mutate } = mockQueueHooks();
    render(<SyncQueueButton />);
    fireEvent.click(screen.getByRole("button", { name: /sync queue/i }));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("is disabled when not connected", () => {
    mockQueueHooks({ connected: false });
    render(<SyncQueueButton />);
    expect(screen.getByRole("button", { name: /sync queue/i })).toBeDisabled();
  });

  it("is disabled and shows a spinner while syncing", () => {
    mockQueueHooks({ syncPending: true });
    render(<SyncQueueButton />);
    expect(screen.getByRole("button", { name: /sync queue/i })).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("does not show a spinner when idle", () => {
    mockQueueHooks();
    render(<SyncQueueButton />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows a 'Sync queue' tooltip on hover", async () => {
    mockQueueHooks();
    render(<SyncQueueButton />);
    fireEvent.mouseOver(screen.getByRole("button", { name: /sync queue/i }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Sync queue");
  });
});
