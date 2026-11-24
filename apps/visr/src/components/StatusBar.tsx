import { Paper } from "@mui/material";
import { useState, type ReactNode } from "react";
import AbortButton from "./AbortButton";
import ScanStatusLine, { type LastPointsStatus } from "./ScanStatusLine";
import { LastPointsContext, useLastPoints } from "../hooks/useLastPoints";

/** Lets a view tell the status bar about its plots' last points */
export function LastPointsProvider({ children }: { children: ReactNode }) {
  const [lastPoints, setLastPoints] = useState<LastPointsStatus | null>(null);
  return (
    <LastPointsContext.Provider value={{ lastPoints, setLastPoints }}>
      {children}
    </LastPointsContext.Provider>
  );
}

/** A narrow strip along the bottom of every page: the scan status, and a way to stop it */
export function StatusBar() {
  const lastPoints = useLastPoints();
  return (
    <Paper
      // a named region, so screen readers can jump to the status and Abort
      component="section"
      aria-label="Scan status"
      square
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        minWidth: 0,
        height: 40,
        px: 2,
        flexShrink: 0,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <ScanStatusLine lastPoints={lastPoints} />
      <AbortButton size="small" />
    </Paper>
  );
}
