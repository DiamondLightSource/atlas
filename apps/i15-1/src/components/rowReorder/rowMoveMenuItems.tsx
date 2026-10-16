// For sci-react-ui. Use its version once released.
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from "lucide-react";
import type {
  MRT_Row,
  MRT_RowData,
  MRT_TableInstance,
} from "material-react-table";

// Move up/down/top/bottom menu items, as an alternative to dragging.
export function rowMoveMenuItems<TData extends MRT_RowData>({
  closeMenu,
  row,
  table,
  onMove,
  isMovable = () => true,
}: {
  closeMenu: () => void;
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
  onMove: (fromIndex: number, toIndex: number) => void;
  isMovable?: (row: MRT_Row<TData>) => boolean;
}) {
  if (!isMovable(row)) return [];

  const movable = table.getPrePaginationRowModel().rows.filter(isMovable);
  const position = movable.findIndex((r) => r.id === row.id);
  const isFirst = position <= 0;
  const isLast = position === movable.length - 1;

  const actions = [
    {
      label: "Move to top",
      Icon: ArrowUpToLine,
      disabled: isFirst,
      to: movable[0],
    },
    {
      label: "Move up",
      Icon: ArrowUp,
      disabled: isFirst,
      to: movable[position - 1],
    },
    {
      label: "Move down",
      Icon: ArrowDown,
      disabled: isLast,
      to: movable[position + 1],
    },
    {
      label: "Move to bottom",
      Icon: ArrowDownToLine,
      disabled: isLast,
      to: movable.at(-1),
    },
  ];

  return actions.map(({ label, Icon, disabled, to }) => (
    <MenuItem
      key={label}
      disabled={disabled}
      onClick={() => {
        closeMenu();
        if (to) onMove(row.index, to.index);
      }}
    >
      {/* Match the text: MUI's default is a fixed grey that looks disabled */}
      <ListItemIcon sx={{ color: "inherit" }}>
        <Icon size={18} />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  ));
}
