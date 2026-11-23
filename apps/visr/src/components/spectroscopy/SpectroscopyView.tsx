import { Box } from "@mui/material";
import SpectroscopyPlots from "./SpectroscopyPlots";
import { useEffect, useState } from "react";
import { useScanEvents } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { visitTextToVisit } from "../../utils/common";
import ControlsPane, { PANE_WIDTH } from "../ControlsPane";
import { SpectroscopyForm } from "./SpectroscopyForm";
import SpectroscopyControls from "./SpectroscopyControls";
import { useInstrumentSession } from "@atlas/app-shell";
import { DataSource } from "./dataSource";
import { plotKindFor, type Positions, type Shape } from "./plotKinds";
import { useSharedState } from "../../hooks/useSharedState";
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
  const [paneOpen, setPaneOpen] = useState(true);
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
  // The plots take the width the controls pane leaves
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        // as tall as the page area and no taller, so only the plots scroll
        minHeight: 0,
        minWidth: paneOpen ? PANE_WIDTH + 400 : 400,
        height: "100%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          // stacked plots scroll, with the scrollbar hidden; never sideways
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <SpectroscopyPlots
          dataSource={dataSource}
          plotKind={plotKindFor(positions, shape)}
          paneOpen={paneOpen}
          plotAspectRatio={PLOT_ASPECT_RATIO}
          onLastPointsChange={setLastPoints}
        />
      </Box>
      <ControlsPane
        open={paneOpen}
        onToggle={() => setPaneOpen(prev => !prev)}
        status={<ScanStatusLine lastPoints={lastPoints} compact={!paneOpen} />}
        tabs={[
          { label: "Scan", content: <SpectroscopyForm /> },
          {
            label: "Display",
            content: (
              <SpectroscopyControls
                dataSource={dataSource}
                onSetDataSource={handleSetDataSource}
                positions={positions}
                onSetPositions={setPositions}
                shape={shape}
                onSetShape={setShape}
              />
            ),
          },
        ]}
      />
    </Box>
  );
}

export default SpectroscopyView;
