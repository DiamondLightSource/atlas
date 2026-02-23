import { Container, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

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
          <Stack direction={"row"} spacing={5}>
            <Button
              component={Link}
              to="/Robot"
              variant="contained"
              startIcon={<PrecisionManufacturingIcon />}
              sx={{ width: 150, height: 50 }}
            >
              <Typography sx={{ mt: "4px" }}> Robot </Typography>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default Dashboard;
