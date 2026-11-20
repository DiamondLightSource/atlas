import { Container, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import QueueIcon from "@mui/icons-material/Queue";

function Dashboard() {
  return (
    <>
      <Container maxWidth="sm" sx={{ mb: 4 }}>
        <Stack direction={"column"} alignItems={"center"} spacing={3}>
          <Typography variant="h4" component="h1" textAlign={"center"}>
            Welcome to I15-1
          </Typography>
          <Stack direction={"row"} spacing={5}>
            <Button
              component={Link}
              to="/Acquisition/Robot"
              variant="contained"
              startIcon={<PrecisionManufacturingIcon />}
              sx={{ width: 150, height: 50 }}
            >
              <Typography sx={{ mt: "4px" }}> Robot </Typography>
            </Button>
            <Button
              component={Link}
              to="/Queue"
              variant="contained"
              startIcon={<QueueIcon />}
              sx={{ width: 150, height: 50 }}
            >
              <Typography sx={{ mt: "4px" }}> Queue </Typography>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default Dashboard;
