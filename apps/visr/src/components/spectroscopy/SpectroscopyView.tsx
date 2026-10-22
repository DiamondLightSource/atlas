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
import { plotKindFor, type Positions, type Shape } from "./plotKinds";
import { useSharedState } from "../../hooks/useSharedState";
import { useScanStatus } from "../../hooks/useScanStatus";
import ScanStatusLine, { type LastPointsStatus } from "../ScanStatusLine";

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
  const scanStatus = useScanStatus();
  const [lastPoints, setLastPoints] = useState<LastPointsStatus | null>(null);

  // Shared across all open tabs (and restored on reload)
  const [dataSource, setDataSource] = useSharedState<DataSource>(
    "spectroscopy:dataSource",
    DataSource.Camera,
  );
  const [positions, setPositions] = useSharedState<Positions>(
    "spectroscopy:positions",
    "setpoints",
  );
  const [shape, setShape] = useSharedState<Shape>(
    "spectroscopy:shape",
    "rectangles",
  );

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
        plotKind={plotKindFor(positions, shape)}
        expanded={!drawerOpen}
        plotAspectRatio={PLOT_ASPECT_RATIO}
        onLastPointsChange={setLastPoints}
      />
      <ControlsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(prev => !prev)}
        status={<ScanStatusLine status={scanStatus} lastPoints={lastPoints} />}
        controls={[
          <SpectroscopyForm key="form" />,
          <SpectroscopyControls
            key="controls"
            dataSource={dataSource}
            onSetDataSource={handleSetDataSource}
            positions={positions}
            onSetPositions={setPositions}
            shape={shape}
            onSetShape={setShape}
          />,
        ]}
      />
    </Box>
  );
}

export default SpectroscopyView;
