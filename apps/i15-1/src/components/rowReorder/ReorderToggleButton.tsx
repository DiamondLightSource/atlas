// For sci-react-ui. Use its version once released.
import { Button } from "@mui/material";

export function ReorderToggleButton({
  label,
  isReordering,
  onToggle,
}: {
  label: string;
  isReordering: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={isReordering ? "contained" : "outlined"}
      color="secondary"
      size="small"
      onClick={onToggle}
      sx={{ minWidth: "8rem" }}
    >
      {isReordering ? "Exit ordering" : label}
    </Button>
  );
}
