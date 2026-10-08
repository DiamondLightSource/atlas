import { Box, Stack } from "@mui/material";
import { ExperimentList } from "../components/ExperimentTable/ULIMSExperimentsTable.tsx";

function Playlist() {
  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%", gap: 1 }}>
      <Stack
        direction={"column"}
        alignItems={"stretch"}
        spacing={3}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <ExperimentList />
      </Stack>
    </Box>
  );
}

export default Playlist;
