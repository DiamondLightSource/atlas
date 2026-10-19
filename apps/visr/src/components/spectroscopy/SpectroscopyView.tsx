import { Box } from "@mui/material";
import SpectroscopyPlots from "./SpectroscopyPlots";
import { useEffect, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { visitTextToVisit } from "../../utils/common";
import ControlsDrawer from "../ControlsDrawer";
import { SpectroscopyForm } from "./SpectroscopyForm";
import SpectroscopyControls from "./SpectroscopyControls";
import { useInstrumentSession } from "@atlas/app-shell";
import { DataSource } from "./dataSource";
import type { PlotKind } from "./useSpectroscopyData";

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

function SpectroscopyView() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [dataSource, setDataSource] = useState(DataSource.Camera);
  const [plotKind, setPlotKind] = useState<PlotKind>("cells");

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

  const handleSetDataSource = (event: React.ChangeEvent<HTMLInputElement>) =>
    setDataSource(event.target.value as DataSource);

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
        height: "100%",
      }}
    >
      <SpectroscopyPlots
        dataSource={dataSource}
        plotKind={plotKind}
        expanded={!drawerOpen}
        plotAspectRatio={PLOT_ASPECT_RATIO}
      />
      <ControlsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(prev => !prev)}
        controls={[
          <SpectroscopyForm />,
          <SpectroscopyControls
            dataSource={dataSource}
            onSetDataSource={handleSetDataSource}
            plotKind={plotKind}
            onSetPlotKind={setPlotKind}
          />,
        ]}
      />
    </Box>
  );
}

export default SpectroscopyView;
