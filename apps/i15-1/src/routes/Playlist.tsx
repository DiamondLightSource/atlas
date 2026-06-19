import { Box, Typography, Stack } from "@mui/material";

import { ExperimentList } from "../components/ExperimentTable/ULIMSExperimentsTable.tsx";

function Playlist() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Stack direction={"column"} alignItems={"center"} spacing={3}>
        <Typography variant="h4" component="h1" textAlign={"center"}>
          Here are some experiments for cm44163-3
        </Typography>
        <ExperimentList />
      </Stack>
    </Box>
  );
}

export default Playlist;
