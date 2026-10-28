// For sci-react-ui: sci-react-ui PR #344 plus changes (no Move menu, which is
// in ./rowMoveMenuItems, and rows are found again by id when dropped).
// Use sci-react-ui's version once released.
import type React from "react";

// Minimal MRT shapes, so `material-react-table` isn't a dependency.
// `index` is the row's position in the source data, across pages and filters.
type MrtRow = { id: string; index: number };
type MrtDragTable = {
  getCoreRowModel: () => { rows: MrtRow[] };
  getState: () => {
    draggingRow?: MrtRow | null;
    hoveredRow?: Partial<MrtRow> | null;
  };
};

// Marks the dragged row and the drop edge on the hovered row while MRT's
// native drag runs; `muiTableBodyRowProps` styles both attributes.
// Module-level: MRT rebuilds the handle props mid-drag, so the onDragEnd
// that fires isn't the one whose onDragStart set this. One drag at a time.
let stopTracking = () => {};

const trackDropEdge = (sourceRow: HTMLElement) => {
  let targetRow: HTMLElement | null = null;
  sourceRow.setAttribute("data-dragging", "");

  const onDragOver = (e: DragEvent) => {
    const tr = (e.target as Element | null)
      ?.closest("td[data-row-id]")
      ?.closest("tr");
    if (!tr || tr === targetRow) return;
    targetRow?.removeAttribute("data-drop-edge");
    targetRow = tr === sourceRow ? null : tr;
    // Line on the edge the row will land on: below when moving down
    const isBelow =
      sourceRow.compareDocumentPosition(tr) & Node.DOCUMENT_POSITION_FOLLOWING;
    targetRow?.setAttribute("data-drop-edge", isBelow ? "bottom" : "top");
  };
  document.addEventListener("dragover", onDragOver);

  return () => {
    document.removeEventListener("dragover", onDragOver);
    sourceRow.removeAttribute("data-dragging");
    targetRow?.removeAttribute("data-drop-edge");
  };
};

// MRT options behind `mrtOptions({ onRowReorder })`: row drag plus a
// Move up/down row menu as the non-drag alternative (WCAG 2.5.7).
export const mrtRowReorderOptions = (
  onRowReorder: (fromIndex: number, toIndex: number) => void,
) => ({
  enableRowOrdering: true,
  // A sort would put moved rows straight back
  enableSorting: false,
  muiRowDragHandleProps: ({ table }: { table: MrtDragTable }) => ({
    onDragStart: (event: React.DragEvent<HTMLElement>) => {
      // Move, not copy: drops the browser's + cursor
      event.dataTransfer.effectAllowed = "move";
      const sourceRow = event.currentTarget.closest("tr");
      if (sourceRow) stopTracking = trackDropEdge(sourceRow);
    },
    onDragEnd: (event: React.DragEvent<HTMLElement>) => {
      stopTracking();
      stopTracking = () => {};
      // "none" when the drag was cancelled (Escape, or released outside)
      if (event.dataTransfer.dropEffect === "none") return;
      const { draggingRow, hoveredRow } = table.getState();
      if (!draggingRow || !hoveredRow?.id || hoveredRow.id === draggingRow.id)
        return;
      // The dragged row's index is from when the drag started. Look both rows
      // up again by id, as the data can change mid-drag (set `getRowId` so
      // that ids are stable). A row that has gone is ignored.
      const rows = table.getCoreRowModel().rows;
      const from = rows.find((r) => r.id === draggingRow.id)?.index;
      const to = rows.find((r) => r.id === hoveredRow.id)?.index;
      if (from !== undefined && to !== undefined) onRowReorder(from, to);
    },
  }),
  // Lets the drag find the hovered row. `className` is there so
  // the return type shares a prop with MUI's `TableCellProps`.
  muiTableBodyCellProps: ({
    row,
  }: {
    row: MrtRow;
  }): { className?: string; "data-row-id": string } => ({
    "data-row-id": row.id,
  }),
  enableRowActions: true,
  positionActionsColumn: "last" as const,
});
