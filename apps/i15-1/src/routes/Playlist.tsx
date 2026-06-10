import { Container, Typography, Stack } from "@mui/material";

import { ExperimentList } from "../components/ExperimentDefinitions.tsx";

function Playlist() {
  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 5, mb: 4 }}>
        <Stack direction={"column"} alignItems={"center"} spacing={3}>
          <Typography variant="h4" component="h1" textAlign={"center"}>
            Here are some experiments for cm44163-3
          </Typography>
          <ExperimentList />
        </Stack>
      </Container>
    </>
  );
}

export default Playlist;
