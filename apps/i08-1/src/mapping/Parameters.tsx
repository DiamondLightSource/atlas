import { Box, Divider, Typography } from "@mui/material";
import { ROIs } from "./roi/ROIs";
import { RasterPath } from "./path/RasterPath";
import { Detector } from "./Detector";
import { RunPlanButton } from "@atlas/blueapi-ui";
import { useInstrumentSession } from "@atlas/app-shell";
import { toPandaScanParameters, useDefinitionManager } from "./definitions";

export function Parameters() {
  const { selected, updateScan } = useDefinitionManager();
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
      <ROIs />
      <Divider orientation="horizontal" flexItem />
      <Typography variant="h6">Scan details</Typography>
      {selected ? (
        // keyed so the uncommitted inputs reset when switching scans
        <Box key={selected.id}>
          <RasterPath
            path={selected.scan.path}
            setPath={path =>
              updateScan(selected.id, scan => ({ ...scan, path }))
            }
          />
          <Detector
            exposure={selected.scan.exposure}
            setExposure={exposure =>
              updateScan(selected.id, scan => ({ ...scan, exposure }))
            }
          />
          <RunPlanButton
            name="panda_scan"
            instrumentSession={instrumentSession}
            params={toPandaScanParameters(selected.scan)}
          />
        </Box>
      ) : (
        <Typography color="text.secondary">
          Add or select a region to edit its scan
        </Typography>
      )}
    </Box>
  );
}
