import { render, screen, fireEvent, within } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { TaskWithPosition } from "../../generated/queue";

vi.mock("../queue/QueueStatusPanel", () => ({
  QueueStatusPanel: () => null,
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
  const mutate = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mutate.mockReset();
    vi.spyOn(queueService, "useQueueEvents").mockImplementation(() => {});
    vi.spyOn(queueService, "useGetQueuedTasks").mockReturnValue(
      result([task("a", 0), task("b", 1), task("c", 2)]),
    );
    vi.spyOn(queueService, "useGetAllTasks").mockReturnValue(result([]));
    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue(result([]));
    vi.spyOn(queueService, "useMoveTask").mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof queueService.useMoveTask>);
  });

  const startReordering = () =>
    fireEvent.click(screen.getByRole("button", { name: "Reorder queue" }));

  const openRowMenu = (rowName: string) => {
    startReordering();
    const row = screen.getByText(rowName).closest("tr") as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: /row actions/i }));
  };

  it("hides drag handles and row menus until Reorder queue is pressed, and Exit ordering hides them", () => {
    render(<QueueView />);

    expect(screen.queryAllByRole("button", { name: /move/i })).toHaveLength(0);
    expect(
      screen.queryAllByRole("button", { name: /row actions/i }),
    ).toHaveLength(0);

    startReordering();

    expect(screen.queryByRole("button", { name: "Reorder queue" })).toBeNull();
    expect(screen.getAllByRole("button", { name: /move/i })).toHaveLength(3);
    expect(
      screen.getAllByRole("button", { name: /row actions/i }),
    ).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Exit ordering" }));

    expect(
      screen.getByRole("button", { name: "Reorder queue" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /move/i })).toHaveLength(0);
  });

  it("moves a task down via the row menu", () => {
    render(<QueueView />);
    openRowMenu("Exp a");
    fireEvent.click(screen.getByRole("menuitem", { name: "Move down" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "a", newPosition: 1 });
  });

  it("moves a task up via the row menu", () => {
    render(<QueueView />);
    openRowMenu("Exp c");
    fireEvent.click(screen.getByRole("menuitem", { name: "Move up" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "c", newPosition: 1 });
  });

  it("moves a task to the top via the row menu", () => {
    render(<QueueView />);
    openRowMenu("Exp c");
    fireEvent.click(screen.getByRole("menuitem", { name: "Move to top" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "c", newPosition: 0 });
  });

  it("moves a task to the bottom via the row menu", () => {
    render(<QueueView />);
    openRowMenu("Exp a");
    fireEvent.click(screen.getByRole("menuitem", { name: "Move to bottom" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "a", newPosition: 2 });
  });

  it("doesn't allow dropping on a row that can't be moved", () => {
    vi.spyOn(queueService, "useGetHistoricTasks").mockReturnValue(
      result([{ ...task("e", 0), position: null, status: "Error" }]),
    );
    render(<QueueView />);
    startReordering();

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

  it("moves the dragged task even if the queue changes mid-drag", () => {
    const queued = vi.spyOn(queueService, "useGetQueuedTasks");
    queued.mockReturnValue(result([task("a", 0), task("b", 1), task("c", 2)]));
    const { rerender } = render(<QueueView />);
    startReordering();

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
    rerender(<QueueView />);

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

  it("disables moving the first task up and to the top", () => {
    render(<QueueView />);
    openRowMenu("Exp a");

    for (const name of ["Move to top", "Move up"]) {
      expect(screen.getByRole("menuitem", { name })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });
});
