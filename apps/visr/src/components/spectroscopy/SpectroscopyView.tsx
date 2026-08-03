import { Box } from "@mui/material";
import RawSpectroscopyData from "./RawSpectroscopyData";
import { useEffect, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
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

function SpectroscopyView() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  // set off workflow when scan ends
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
  });

  const DRAWER_COLLAPSED_HEIGHT = 64;
  const NAVBAR_HEIGHT = 32;
  const PLOT_ASPECT_RATIO = 0.75;

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
      <RawSpectroscopyData
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
