import { useInstrumentSession } from "@atlas/app-shell";
import { useAuth } from "@atlas/auth";
import { Box } from "@mui/material";
import { Console } from "./Console";
import { LatestScan } from "./tiled/LatestScan";

export function Dashboard() {
  const { instrumentSession } = useInstrumentSession();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, width: "50%" }}
    >
      {isAuthenticated && instrumentSession && (
        <LatestScan session={instrumentSession} />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: 400,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Console />
      </Box>
    </Box>
  );
}
