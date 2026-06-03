import { Container, Typography, Stack } from "@mui/material";

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
        </Stack>
      </Container>
    </>
  );
}

export default Dashboard;
