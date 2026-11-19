import type { SelectionBase } from "@diamondlightsource/davidia";
import { Box, Divider, Typography } from "@mui/material";
import { ROIs } from "./roi/ROIs";
import { RasterPath, type Raster } from "./path/RasterPath";
import { useState } from "react";
import { Detector } from "./Detector";
import { RunPlanButton } from "@atlas/blueapi-ui";
import { useInstrumentSession } from "@atlas/app-shell";

type Props = {
  selections: SelectionBase[];
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[]>>;
};

type PandaScanParameters = {
  start: number;
  start_slow: number;
  stop: number;
  stop_slow: number;
  num: number;
  duration: number;
};

export function Parameters(props: Props) {
  const [path, setPath] = useState<Raster>({ xStep: 0.5, yStep: 0.5 });
  const [exposure, setExposure] = useState<number>(0.1);
  const [selectedRoi, setSelectedRoi] = useState<SelectionBase | undefined>(
    undefined,
  );

  const { instrumentSession } = useInstrumentSession();
  return (
    <Box
      sx={theme => ({
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme.palette.background.paper,
        p: 1.5,
        gap: 1,
      })}
    >
      <ROIs {...props} selectedRoi={selectedRoi} setSelected={setSelectedRoi} />
      <Divider orientation="horizontal" flexItem />
      <Typography variant="h6">Scan details</Typography>
      <RasterPath path={path} setPath={setPath} />
      <Detector exposure={exposure} setExposure={setExposure} />
      <RunPlanButton
        name="panda_scan"
        instrumentSession={instrumentSession}
        params={{}}
      />
    </Box>
  );
}
