import { Box } from "@mui/material";
import SpectroscopyPlots from "./SpectroscopyPlots";
import { useEffect, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { useInstrumentSession } from "@atlas/app-shell";
import { visitTextToVisit } from "../../utils/common";
import ControlsDrawer from "../ControlsDrawer";
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

const DRAWER_COLLAPSED_HEIGHT = 80;
const NAVBAR_HEIGHT = 48;
const PLOT_ASPECT_RATIO = "equal";

function SpectroscopyView() {
  const [drawerOpen, setDrawerOpen] = useState(true);

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
        flexGrow: 1,
        minWidth: drawerOpen ? 600 : 400,
        height: `calc(100vh - ${DRAWER_COLLAPSED_HEIGHT + NAVBAR_HEIGHT}px)`,
      }}
    >
      <SpectroscopyPlots
        expanded={!drawerOpen}
        plotAspectRatio={PLOT_ASPECT_RATIO}
      />
      <ControlsDrawer
        open={drawerOpen}
        collapsedHeight={DRAWER_COLLAPSED_HEIGHT}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={<SpectroscopyForm />}
      />
    </Box>
  );
}

export default SpectroscopyView;
