import { Box, Grid } from "@mui/material";
import { Map } from "./Map";

export function Mapping() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
        }}
      >
        <Grid size={2}>Datasets</Grid>
        <Grid size={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "& > div": {
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                },
              }}
            >
              <Map />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "& > div": {
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                },
              }}
            >
              <Map />
            </Box>
          </Box>
        </Grid>
        <Grid size={4}>Scan parameters</Grid>
      </Grid>
    </Box>
  );
}
