import { Typography } from "@mui/material";

// tiled answers 404 for an empty session and for one the user can't see alike
export const NO_SCANS =
  "No scans found. This session may be empty, or you may not have access to it.";

/** A loading, error or empty state in place of content */
export function Message({ children }: { children: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}
