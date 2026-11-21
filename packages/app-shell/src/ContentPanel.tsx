import type { ReactNode } from "react";
import { Box } from "@mui/material";

/** Padded, scrollable content area for a page with no tabs */
export function ContentPanel({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
  );
}
