import { useInstrumentSession } from "@atlas/app-shell";
import { Typography } from "@mui/material";
import { ScanBrowser } from "./tiled/ScanBrowser";

export function ScansPage() {
  const { instrumentSession } = useInstrumentSession();

  if (!instrumentSession) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select an instrument session to see its scans
      </Typography>
    );
  }
  return <ScanBrowser key={instrumentSession} session={instrumentSession} />;
}
