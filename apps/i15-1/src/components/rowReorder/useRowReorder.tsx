import { useEffect, useState, type ReactNode } from "react";
import {
  type MRT_Column,
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_VisibilityState,
} from "material-react-table";
import { mrtRowReorderOptions } from "./mrtRowReorder";
import { ReorderToggleButton } from "./ReorderToggleButton";
import { rowMoveMenuItems } from "./rowMoveMenuItems";

// Drop-line styles from sci-react-ui PR #344, in secondary rather than primary.
const rowReorderBodyRowSx = {
  "&[data-dragging]": { opacity: 0.5 },
  "&[data-drop-edge]": { opacity: 1 },
  "&[data-dragging] td, &[data-drop-edge] td": {
    borderTop: "none !important",
    borderLeft: "none !important",
    borderRight: "none !important",
    borderBottom: "1px solid var(--mui-palette-TableCell-border) !important",
  },
  '&[data-drop-edge="top"] td': {
    boxShadow: "inset 0 2px 0 var(--ds-secondary-accent)",
  },
  '&[data-drop-edge="bottom"] td': {
    boxShadow: "inset 0 -2px 0 var(--ds-secondary-accent)",
  },
  "&[data-drop-edge] td[data-immovable]": { boxShadow: "none" },
} as const;

// MRT fades its row actions button to half opacity and MUI's default icon
// colour is a fixed grey, which together look disabled.
const rowActionsCellSx = {
  "& .MuiIconButton-root": { opacity: 1, color: "text.secondary" },
} as const;

// Row reordering for an MRT table, switched on by a toolbar toggle.
// For sci-react-ui. Use its version once released.
//
// `onReorder` gets source-data indices. Give the table a stable `getRowId`,
// spread `tableOptions` into it, merge `state`, `rowSx` and `toolbarSx` into its
// own `state` and `sx`, and render `toggleButton` in the toolbar.
export function useRowReorder<TData extends MRT_RowData>({
  label,
  onReorder,
  isMovable = () => true,
}: {
  label: string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isMovable?: (row: MRT_Row<TData>) => boolean;
}) {
  const [isReordering, setIsReordering] = useState(false);
  // Owned here so the reorder columns can be forced on and off
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    {},
  );
  const reorder = mrtRowReorderOptions(onReorder);

  // Rows that can't move can't take a drop either: the browser shows "not
  // allowed" and the drag ends as cancelled. Set here rather than on the cells,
  // as MRT's cells override `onDragOver`.
  useEffect(() => {
    if (!isReordering) return;
    const refuseDrop = (event: globalThis.DragEvent) => {
      const target = event.target as Element | null;
      if (event.dataTransfer && target?.closest("[data-immovable]"))
        event.dataTransfer.dropEffect = "none";
    };
    document.addEventListener("dragover", refuseDrop);
    return () => document.removeEventListener("dragover", refuseDrop);
  }, [isReordering]);

  return {
    isReordering,
    state: {
      columnVisibility: {
        ...columnVisibility,
        "mrt-row-drag": isReordering,
        "mrt-row-actions": isReordering,
      },
    },
    rowSx: rowReorderBodyRowSx,
    // Marks the mode in the toolbar
    toolbarSx: isReordering
      ? {
          backgroundColor: "var(--ds-secondary-container)",
          color: "var(--ds-on-secondary-container)",
          // Inset, so the toolbar keeps its height
          boxShadow: "inset 0 -1px 0 rgb(var(--ds-secondary-channel) / 0.15)",
        }
      : undefined,
    // Place this in the table's toolbar
    toggleButton: (
      <ReorderToggleButton
        label={label}
        isReordering={isReordering}
        onToggle={() => setIsReordering((current) => !current)}
      />
    ),
    tableOptions: {
      ...reorder,
      onColumnVisibilityChange: setColumnVisibility,
      muiTableBodyCellProps: (props: {
        row: MRT_Row<TData>;
        column: MRT_Column<TData>;
      }) => ({
        ...reorder.muiTableBodyCellProps(props),
        // Marks rows that can't take a drop, see the effect above
        ...(!isMovable(props.row) && { "data-immovable": "" }),
        ...(props.column.id === "mrt-row-actions" && { sx: rowActionsCellSx }),
      }),
      muiRowDragHandleProps: (props: {
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => {
        const movable = isMovable(props.row);
        return {
          ...reorder.muiRowDragHandleProps(props),
          draggable: movable,
          sx: movable ? { color: "text.secondary" } : { display: "none" },
        };
      },
      renderRowActionMenuItems: (props: {
        closeMenu: () => void;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }): ReactNode[] =>
        rowMoveMenuItems({ ...props, onMove: onReorder, isMovable }),
    },
  };
}
