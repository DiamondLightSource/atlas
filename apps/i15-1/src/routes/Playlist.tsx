import { Box, Typography, Stack } from "@mui/material";

import { ExperimentList } from "../components/ExperimentTable/ULIMSExperimentsTable.tsx";

function Playlist() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Stack direction={"column"} alignItems={"center"} spacing={3}>
        <ExperimentList />
      </Stack>
    </Box>
  );
}

export default Playlist;
