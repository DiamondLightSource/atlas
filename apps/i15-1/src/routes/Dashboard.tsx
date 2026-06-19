import { Container, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import QueueIcon from "@mui/icons-material/Queue";
import InstrumentSessionView from "../components/InstrumentSessionSelection/InstrumentSessionView.tsx";
import { useUserAuth } from "../context/userAuth/useUserAuth.ts";
import { User } from "@diamondlightsource/sci-react-ui";

function Dashboard() {
  const user = useUserAuth();

  const handleLogIn = () => window.location.assign("/oauth2/sign_in");
  const handleLogOut = () => window.location.assign("/oauth2/sign_out");
  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 5, mb: 4 }}>
        <Stack direction={"column"} alignItems={"center"} spacing={3}>
          <Typography variant="h4" component="h1" textAlign={"center"}>
            Welcome to I15-1
          </Typography>
          <User
            onLogin={handleLogIn}
            onLogout={handleLogOut}
            user={
              user.person == null || user.person == undefined
                ? null
                : { fedid: user.person }
            }
            colour="white"
          />
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
