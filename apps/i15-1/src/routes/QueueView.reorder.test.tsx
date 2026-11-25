import { render, screen, act } from "@atlas/vitest-conf";
import type { UseQueryResult } from "@tanstack/react-query";
import type { MRT_Row } from "material-react-table";
import { QueueView } from "./QueueView";
import * as queueService from "../queue/queueService";
import type { QueueTableData } from "../queue/tableData";
import type { TaskWithPosition } from "../../generated/queue";
import { useRowReorder } from "../components/rowReorder/useRowReorder";

// QueueView's own part of reordering: which rows may move, and turning the
// table indices useRowReorder reports into a moveTask call. The drag and menu
// behaviour is useRowReorder's, tested in useRowReorder.test.tsx and
// rowMoveMenuItems.test.tsx, so it and the table are mocked here.

vi.mock("material-react-table", () => ({
  MaterialReactTable: ({
    table,
  }: {
    table: { options: { renderTopToolbarCustomActions?: () => unknown } };
  }) => <div>{table.options.renderTopToolbarCustomActions?.() as never}</div>,
  useMaterialReactTable: (options: unknown) => ({ options }),
}));
vi.mock("../components/rowReorder/useRowReorder", () => ({
  useRowReorder: vi.fn(() => ({
    isReordering: false,
    state: {},
    rowSx: {},
    toolbarSx: undefined,
    tableOptions: {},
    toggleButton: <button>Reorder toggle</button>,
  })),
}));
vi.mock("../queue/QueueStatusPanel", () => ({ QueueStatusPanel: () => null }));
vi.mock("../queue/QueueEstimatedRuntime", () => ({
  QueueEstimatedRuntime: () => null,
}));

const task = (id: string, position: number | null, status = "Queued") => ({
  user: null,
  id,
  position,
  status,
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

// The options QueueView passed to useRowReorder on its latest render
const reorderOptions = () => {
  const options = vi.mocked(useRowReorder).mock.calls.at(-1)?.[0];
  if (!options) throw new Error("useRowReorder was not called");
  // The mock's calls lose QueueView's row type
  return options as Parameters<typeof useRowReorder<QueueTableData>>[0];
};
const reorder = (fromIndex: number, toIndex: number) =>
  act(() => reorderOptions().onReorder(fromIndex, toIndex));
const rowWithStatus = (status: string) =>
  ({ original: { status } }) as MRT_Row<QueueTableData>;

describe("QueueView row reordering", () => {
  const mutate = vi.fn();
  const getTasks = vi.spyOn(queueService, "useGetTasks");

  beforeEach(() => {
    vi.mocked(useRowReorder).mockClear();
    mutate.mockReset();
    vi.spyOn(queueService, "useQueueEvents").mockImplementation(() => {});
    getTasks.mockReturnValue(
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

  it("shows the reorder toggle except for historic tasks", () => {
    const { rerender } = render(<QueueView instrument="i15-1" />);
    expect(reorderOptions().label).toBe("Reorder queue");
    expect(screen.getByText("Reorder toggle")).toBeInTheDocument();

    rerender(<QueueView displayMode="historic" instrument="i15-1" />);
    expect(screen.queryByText("Reorder toggle")).not.toBeInTheDocument();
  });

  it("only lets queued tasks move", () => {
    render(<QueueView instrument="i15-1" />);
    const { isMovable } = reorderOptions();

    expect(isMovable?.(rowWithStatus("Queued"))).toBe(true);
    for (const status of ["Error", "Complete", "Running", "Cancelled"]) {
      expect(isMovable?.(rowWithStatus(status))).toBe(false);
    }
  });

  it.each([
    { from: 0, to: 1, taskId: "a", newPosition: 1 },
    { from: 2, to: 1, taskId: "c", newPosition: 1 },
    { from: 2, to: 0, taskId: "c", newPosition: 0 },
    { from: 0, to: 2, taskId: "a", newPosition: 2 },
  ])(
    "moves the task at row $from to row $to",
    ({ from, to, taskId, newPosition }) => {
      render(<QueueView instrument="i15-1" />);
      reorder(from, to);
      expect(mutate).toHaveBeenCalledExactlyOnceWith({ taskId, newPosition });
    },
  );

  it("converts row indices to queue positions when other tasks are shown", () => {
    // A finished task above the queue shifts the rows down by one
    getTasks.mockReturnValue(
      result([task("done", null, "Complete"), task("a", 0), task("b", 1)]),
    );
    render(<QueueView displayMode="all" instrument="i15-1" />);

    reorder(2, 1);
    expect(mutate).toHaveBeenCalledExactlyOnceWith({
      taskId: "b",
      newPosition: 0,
    });
  });

  it("ignores moves from a task that isn't queued or has no position, or to a row that doesn't exist", () => {
    getTasks.mockReturnValue(
      result([
        task("a", 0),
        task("b", 1),
        // Has a position, so only its status stops it moving
        task("r", 2, "Running"),
        task("e", null, "Error"),
      ]),
    );
    render(<QueueView displayMode="all" instrument="i15-1" />);

    reorder(2, 0);
    reorder(3, 0);
    reorder(0, 5);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("uses the current tasks if the queue changes before the move", () => {
    const { rerender } = render(<QueueView instrument="i15-1" />);
    // a finishes, so b and c move up a row
    getTasks.mockReturnValue(result([task("b", 1), task("c", 2)]));
    rerender(<QueueView instrument="i15-1" />);

    reorder(0, 1);
    expect(mutate).toHaveBeenCalledExactlyOnceWith({
      taskId: "b",
      newPosition: 2,
    });
  });
});
