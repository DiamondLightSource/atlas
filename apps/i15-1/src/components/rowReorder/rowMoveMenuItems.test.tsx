import { render, screen, fireEvent } from "@atlas/vitest-conf";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import { rowMoveMenuItems } from "./rowMoveMenuItems";

type Item = { id: string; locked?: boolean };

// Only the parts of MRT's row and table that rowMoveMenuItems reads
const rows = (
  [{ id: "a" }, { id: "b", locked: true }, { id: "c" }, { id: "d" }] as Item[]
).map((original, index) => ({ id: original.id, index, original }));
const table = {
  getPrePaginationRowModel: () => ({ rows }),
} as unknown as MRT_TableInstance<Item>;
const isMovable = (row: MRT_Row<Item>) => !row.original.locked;

const renderMenu = (id: string) => {
  const onMove = vi.fn();
  const closeMenu = vi.fn();
  const row = rows.find((r) => r.id === id) as unknown as MRT_Row<Item>;
  render(
    <ul>{rowMoveMenuItems({ row, table, onMove, closeMenu, isMovable })}</ul>,
  );
  const item = (name: string) => screen.getByRole("menuitem", { name });
  return { onMove, closeMenu, item };
};

describe("rowMoveMenuItems", () => {
  it.each([
    // Row b is locked, so moves skip over it
    { id: "c", name: "Move up", to: 0 },
    { id: "c", name: "Move down", to: 3 },
    { id: "a", name: "Move down", to: 2 },
    { id: "d", name: "Move to top", to: 0 },
    { id: "a", name: "Move to bottom", to: 3 },
  ])("$name from row $id moves to index $to", ({ id, name, to }) => {
    const { onMove, closeMenu, item } = renderMenu(id);
    fireEvent.click(item(name));

    const from = rows.findIndex((r) => r.id === id);
    expect(onMove).toHaveBeenCalledExactlyOnceWith(from, to);
    expect(closeMenu).toHaveBeenCalled();
  });

  it("disables moving the first row up", () => {
    const first = renderMenu("a");
    for (const name of ["Move to top", "Move up"]) {
      expect(first.item(name)).toHaveAttribute("aria-disabled", "true");
    }
    for (const name of ["Move down", "Move to bottom"]) {
      expect(first.item(name)).not.toHaveAttribute("aria-disabled");
    }
  });

  it("disables moving the last row down", () => {
    const last = renderMenu("d");
    for (const name of ["Move down", "Move to bottom"]) {
      expect(last.item(name)).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("has no items for a row that can't move", () => {
    const { closeMenu, onMove } = { closeMenu: vi.fn(), onMove: vi.fn() };
    const row = rows[1] as unknown as MRT_Row<Item>;
    expect(
      rowMoveMenuItems({ row, table, onMove, closeMenu, isMovable }),
    ).toEqual([]);
  });
});
