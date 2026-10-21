import { render, screen, fireEvent, within } from "@atlas/vitest-conf";
import { describe, it, expect, vi } from "vitest";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useRowReorder } from "./useRowReorder";

type Item = { id: string; name: string; locked?: boolean };

const columns: MRT_ColumnDef<Item>[] = [
  { accessorKey: "name", header: "Name" },
];

function Toy({
  items,
  onReorder,
}: {
  items: Item[];
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const reorder = useRowReorder<Item>({
    label: "Reorder items",
    onReorder,
    isMovable: (row) => !row.original.locked,
  });
  const table = useMaterialReactTable({
    columns,
    data: items,
    getRowId: (item) => item.id,
    enablePagination: false,
    state: { ...reorder.state },
    ...reorder.tableOptions,
    muiTableBodyRowProps: { sx: reorder.rowSx },
    muiTopToolbarProps: { sx: reorder.toolbarSx },
    renderTopToolbarCustomActions: () => reorder.toggleButton,
  });
  return <MaterialReactTable table={table} />;
}

const items: Item[] = [
  { id: "a", name: "Item a" },
  { id: "b", name: "Item b", locked: true },
  { id: "c", name: "Item c" },
];

const rowOf = (name: string) =>
  screen.getByText(name).closest("tr") as HTMLElement;
const handles = () => screen.queryAllByRole("button", { name: /^move$/i });
const startReordering = () =>
  fireEvent.click(screen.getByRole("button", { name: "Reorder items" }));
const dataTransfer = () => ({
  effectAllowed: "",
  dropEffect: "move",
  setDragImage: () => {},
});

describe("useRowReorder", () => {
  it("shows handles and row menus only while reordering", () => {
    render(<Toy items={items} onReorder={vi.fn()} />);
    expect(handles()).toHaveLength(0);

    startReordering();
    // The locked row has neither
    expect(handles()).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /row actions/i }),
    ).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Exit ordering" }));
    expect(handles()).toHaveLength(0);
  });

  it("moves to the top and bottom among the movable rows", () => {
    const onReorder = vi.fn();
    render(<Toy items={items} onReorder={onReorder} />);
    startReordering();

    fireEvent.click(
      within(rowOf("Item c")).getByRole("button", { name: /row actions/i }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Move to top" }));
    expect(onReorder).toHaveBeenLastCalledWith(2, 0);

    fireEvent.click(
      within(rowOf("Item a")).getByRole("button", { name: /row actions/i }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Move to bottom" }));
    expect(onReorder).toHaveBeenLastCalledWith(0, 2);
  });

  it("finds the rows by id if the data changes mid-drag", () => {
    const onReorder = vi.fn();
    const all: Item[] = [
      { id: "a", name: "Item a" },
      { id: "b", name: "Item b" },
      { id: "c", name: "Item c" },
    ];
    const { rerender } = render(<Toy items={all} onReorder={onReorder} />);
    startReordering();

    const dt = dataTransfer();
    fireEvent.dragStart(handles()[1], { dataTransfer: dt });
    // Item a goes, so b moves from index 1 to 0 and c from 2 to 1
    rerender(<Toy items={all.slice(1)} onReorder={onReorder} />);
    fireEvent.dragEnter(rowOf("Item c"), { dataTransfer: dt });
    fireEvent.dragEnd(handles()[0], { dataTransfer: dt });

    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it("refuses a drop on a row that can't move", () => {
    const onReorder = vi.fn();
    render(<Toy items={items} onReorder={onReorder} />);
    startReordering();

    const dt = dataTransfer();
    const lockedCell = within(rowOf("Item b")).getAllByRole("cell")[1];
    expect(lockedCell).toHaveAttribute("data-immovable");

    fireEvent.dragStart(handles()[0], { dataTransfer: dt });
    fireEvent.dragEnter(rowOf("Item b"), { dataTransfer: dt });
    fireEvent.dragOver(lockedCell, { dataTransfer: dt });
    expect(dt.dropEffect).toBe("none");

    fireEvent.dragEnd(handles()[0], { dataTransfer: dt });
    expect(onReorder).not.toHaveBeenCalled();
  });
});
