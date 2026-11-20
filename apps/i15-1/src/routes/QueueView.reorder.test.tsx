import {
  render,
  screen,
  fireEvent,
  within,
  userEvent,
  waitFor,
} from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { TaskWithPosition } from "../../generated/queue";

vi.mock("../queue/QueueStatusPanel", () => ({
  QueueStatusPanel: () => null,
}));
vi.mock("../queue/QueueEstimatedRuntime", () => ({
  QueueEstimatedRuntime: () => null,
}));

// Uses the real MaterialReactTable, unlike QueueView.test.tsx
const task = (id: string, position: number) => ({
  user: null,
  id,
  position,
  status: "Queued",
  experiment: {
    name: `Exp ${id}`,
    instrument_session: `session${id}`,
    sample: null,
    experiment_definition: { name: "plan", id: "1", data: {} },
  },
  blueapi_calls: [],
  kind: "Experiment",
});

const result = (data: unknown) =>
  ({ data, isPending: false, error: null }) as Partial<
    UseQueryResult<TaskWithPosition[], Error>
  > as UseQueryResult<TaskWithPosition[], Error>;

describe("QueueView row reordering", () => {
  const user = userEvent.setup();
  const mutate = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mutate.mockReset();
    vi.spyOn(queueService, "useQueueEvents").mockImplementation(() => {});
    vi.spyOn(queueService, "useGetTasks").mockReturnValue(
      result([task("a", 0), task("b", 1), task("c", 2)]),
    );
    vi.spyOn(queueService, "useMoveTask").mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof queueService.useMoveTask>);
    vi.spyOn(queueService, "useCancelTasks").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof queueService.useCancelTasks>);
  });

  const startReordering = async () =>
    await user.click(screen.getByRole("button", { name: "Reorder queue" }));

  const openRowMenu = async (rowName: string) => {
    await startReordering();
    const row = screen.getByText(rowName).closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: /row actions/i }));
  };

  it("hides drag handles and row menus until Reorder queue is pressed, and Exit ordering hides them", async () => {
    render(<QueueView instrument="i15-1" />);

    // initial state
    expect(screen.queryAllByRole("button", { name: /move/i })).toHaveLength(0);
    expect(
      screen.queryAllByRole("button", { name: /row actions/i }),
    ).toHaveLength(0);

    // enter reorder mode
    await startReordering();

    await waitFor(() => {
      expect(screen.queryAllByRole("button", { name: /move/i })).toHaveLength(
        3,
      );
      expect(
        screen.queryAllByRole("button", { name: /row actions/i }),
      ).toHaveLength(3);
    });

    expect(
      screen.queryByRole("button", { name: "Reorder queue" }),
    ).not.toBeInTheDocument();

    // exit reorder mode
    await user.click(screen.getByRole("button", { name: "Exit ordering" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Reorder queue" }),
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("button", { name: /move/i })).toHaveLength(
        0,
      );
    });
  });

  it("moves a task down via the row menu", async () => {
    render(<QueueView instrument="i15-1" />);
    await openRowMenu("Exp a");
    await user.click(screen.getByRole("menuitem", { name: "Move down" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "a", newPosition: 1 });
  });

  it("moves a task up via the row menu", async () => {
    render(<QueueView instrument="i15-1" />);
    await openRowMenu("Exp c");
    await user.click(screen.getByRole("menuitem", { name: "Move up" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "c", newPosition: 1 });
  });

  it("moves a task to the top via the row menu", async () => {
    render(<QueueView instrument="i15-1" />);
    await openRowMenu("Exp c");
    await user.click(screen.getByRole("menuitem", { name: "Move to top" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "c", newPosition: 0 });
  });

  it("moves a task to the bottom via the row menu", async () => {
    render(<QueueView instrument="i15-1" />);
    await openRowMenu("Exp a");
    await user.click(screen.getByRole("menuitem", { name: "Move to bottom" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "a", newPosition: 2 });
  });

  it("doesn't allow dropping on a row that can't be moved", async () => {
    vi.spyOn(queueService, "useGetTasks").mockReturnValue(
      result([
        task("a", 0),
        task("b", 1),
        task("c", 2),
        { ...task("e", 0), position: null, status: "Error" },
      ]),
    );
    render(<QueueView displayMode="all" instrument="i15-1" />);
    await startReordering();

    // Only the three queued tasks can be dragged
    const handles = screen.getAllByRole("button", { name: /^move$/i });
    expect(handles).toHaveLength(3);

    const errorCell = within(
      screen.getByText("Exp e").closest("tr") as HTMLElement,
    ).getAllByRole("cell")[2];
    expect(errorCell).toHaveAttribute("data-immovable");

    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "move",
      setDragImage: () => {},
    };
    fireEvent.dragStart(handles[0], { dataTransfer });
    fireEvent.dragEnter(errorCell.closest("tr") as HTMLElement, {
      dataTransfer,
    });
    fireEvent.dragOver(errorCell, { dataTransfer });
    expect(dataTransfer.dropEffect).toBe("none");

    fireEvent.dragEnd(handles[0], { dataTransfer });
    expect(mutate).not.toHaveBeenCalled();
  });

  it("moves the dragged task even if the queue changes mid-drag", async () => {
    const queued = vi.spyOn(queueService, "useGetTasks");
    queued.mockReturnValue(result([task("a", 0), task("b", 1), task("c", 2)]));
    const { rerender } = render(<QueueView instrument="i15-1" />);
    await startReordering();

    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "move",
      setDragImage: () => {},
    };
    // Pick up b (index 1), then a finishes and b becomes index 0
    fireEvent.dragStart(screen.getAllByRole("button", { name: /^move$/i })[1], {
      dataTransfer,
    });
    queued.mockReturnValue(result([task("b", 1), task("c", 2)]));
    rerender(<QueueView instrument="i15-1" />);

    fireEvent.dragEnter(
      screen.getByText("Exp c").closest("tr") as HTMLElement,
      {
        dataTransfer,
      },
    );
    fireEvent.dragEnd(screen.getAllByRole("button", { name: /^move$/i })[0], {
      dataTransfer,
    });

    expect(mutate).toHaveBeenCalledWith({ taskId: "b", newPosition: 2 });
  });

  it("disables moving the first task up and to the top", async () => {
    render(<QueueView instrument="i15-1" />);
    await openRowMenu("Exp a");

    for (const name of ["Move to top", "Move up"]) {
      expect(screen.getByRole("menuitem", { name })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });
});
