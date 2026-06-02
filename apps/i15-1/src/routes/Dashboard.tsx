import { Container, Typography, Button, Stack } from "@mui/material";

import InstrumentSessionView from "../components/InstrumentSessionSelection/InstrumentSessionView.tsx";

function Dashboard() {
  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 5, mb: 4 }}>
        <Stack direction={"column"} alignItems={"center"} spacing={3}>
          <Typography variant="h4" component="h1" textAlign={"center"}>
            Welcome to I15-1
          </Typography>
          <InstrumentSessionView
            sessionsList={[
              "cm12345-1",
              "cm12345-2",
              "cm12345-3",
              "cm12345-4",
              "cm12345-5",
            ]}
          />
        </Stack>
      </Container>
    </>
  );
}

export default Dashboard;
