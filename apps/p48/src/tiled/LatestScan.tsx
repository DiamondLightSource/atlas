import { ProgressDelayed } from "@diamondlightsource/sci-react-ui";
import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ScanSummary } from "./ScanSummary";
import { useGetLatestRun } from "./tiledService";

// The page itself: going via /scans redirects, which drops what was clicked
const SCANS_PAGE = "/scans/scans";

function Message({ children }: { children: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}

/** The session's newest scan, kept up to date while it runs */
export function LatestScan({ session }: { session: string }) {
  const latest = useGetLatestRun(session);
  const navigate = useNavigate();

  return (
    <Box component="section" aria-label="Latest scan">
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
        <Typography variant="h6">Latest scan</Typography>
        <Link component={RouterLink} to={SCANS_PAGE} variant="body2">
          View all scans
        </Link>
      </Box>
      {latest.data && (
        <ScanSummary
          run={latest.data}
          onShow={(selection) => navigate(SCANS_PAGE, { state: selection })}
        />
      )}
      {latest.isPending && <ProgressDelayed />}
      {latest.isError && <Message>Could not fetch from Tiled</Message>}
      {latest.data === null && <Message>No scans in this session yet</Message>}
    </Box>
  );
}
