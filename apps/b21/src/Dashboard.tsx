import { Box, Typography } from "@mui/material";
import { InstrumentSessionButton } from "./components/getInstrumentSessionsButton";
/**
 * Placeholder landling page. A suggestion would be:
 *  - name of beamline and very brief description;
 *  - general status of the beamline e.g. 'Scanning',
 *  - quick links to the likely first steps
 */
export function Dashboard() {
  return (
    <Box>
      <Typography variant="h4Display">
        Welcome to the Science UI for B21
      </Typography>
      <Typography variant="body1">
        This page should show the beamline at a glance, without requiring
        logging in.
      </Typography>
      <InstrumentSessionButton />
    </Box>
  );
}
