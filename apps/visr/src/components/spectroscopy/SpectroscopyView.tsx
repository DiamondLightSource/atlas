import { Box } from "@mui/material";
import SpectroscopyPlots from "./SpectroscopyPlots";
import { useEffect, useRef, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { useInstrumentSession } from "@atlas/app-shell";
import { visitTextToVisit } from "../../utils/common";
import ControlsDrawer from "../ControlsDrawer";
import HeightHandle from "../HeightHandle";
import { SpectroscopyForm } from "./SpectroscopyForm";

export type SpectroscopyFormData = {
  total_number_of_scan_points: number;
  grid_size: number;
  grid_origin_x: number;
  grid_origin_y: number;
  exposure_time: number;
};

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const PLOT_ASPECT_RATIO = "equal";

/** Where this browser remembers the plots' dragged height */
const PLOTS_HEIGHT_KEY = "visr.spectroscopy.plotsHeight";

function storedPlotsHeight(): number | null {
  try {
    const value = Number(localStorage.getItem(PLOTS_HEIGHT_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

function storePlotsHeight(height: number | null) {
  try {
    if (height) localStorage.setItem(PLOTS_HEIGHT_KEY, String(height));
    else localStorage.removeItem(PLOTS_HEIGHT_KEY);
  } catch {
    // not remembered, which is fine
  }
}

function SpectroscopyView() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [plotsHeight, setPlotsHeight] = useState(storedPlotsHeight);
  const plotsRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Set off workflow when scan ends
  // -------------------------------------------------------------------------
  const scanEvent = useScanEvents();
  const { instrumentSession } = useInstrumentSession();

  const submitWorkflow = useSubmitWorkflow("visr-reconstruction");

  useEffect(() => {
    if (!scanEvent || !instrumentSession) return;
    if (scanEvent.status == "finished") {
      const visit = visitTextToVisit(instrumentSession);
      if (!visit) {
        console.warn("Invalid visit; cannot submit workflow");
        return;
      }
      submitWorkflow(visit, {
        "input-file-path": scanEvent.filepath,
      });
    }
  }, [scanEvent, instrumentSession, submitWorkflow]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  // Flex column, not grid: the plots take the remaining space via flex:1 1 0
  // and the drawer keeps its own height. A grid would split the spare height
  // evenly between the two rows instead.
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: drawerOpen ? 600 : 400,
      }}
    >
      <SpectroscopyPlots
        expanded={!drawerOpen}
        plotAspectRatio={PLOT_ASPECT_RATIO}
        height={plotsHeight}
        containerRef={plotsRef}
      />
      <HeightHandle
        target={plotsRef}
        value={plotsHeight}
        onChange={height => {
          setPlotsHeight(height);
          storePlotsHeight(height);
        }}
        label="Height of the plots"
      />
      <ControlsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={<SpectroscopyForm />}
      />
    </Box>
  );
}

export default SpectroscopyView;
