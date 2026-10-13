// Fills the parent (which needs a bounded height) and scrolls rows inside the table
export const fillParentTableProps = {
  enableStickyHeader: true,
  muiTablePaperProps: {
    sx: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 },
  },
  muiTableContainerProps: {
    sx: { flex: 1, minHeight: 0, maxHeight: "none" },
  },
} as const;
