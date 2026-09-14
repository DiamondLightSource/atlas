import { Container, Typography, Stack, Button } from "@mui/material";
import { FileText, ServerCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../context/userAuth/useUserAuth";
import { User } from "@diamondlightsource/sci-react-ui";

const Dashboard = () => {
  const user = useUserAuth();

  const handleLogIn = () => window.location.assign("/oauth2/sign_in");
  const handleLogOut = () => window.location.assign("/oauth2/sign_out");

  return (
    <Container maxWidth={false} sx={{ minHeight: "100vh", mt: 3, mb: 3 }}>
      <Stack direction="column" alignItems="center" spacing={3}>
        <Typography variant="h3">Welcome to P99!</Typography>
        <User
          onLogin={handleLogIn}
          onLogout={handleLogOut}
          user={
            user.person == null || user.person == undefined
              ? null
              : { fedid: user.person }
          }
        />
        <Button
          component={Link}
          to="/Acquisition/Plans"
          variant="contained"
          startIcon={<FileText />}
          sx={{ width: 150, height: 50 }}
        >
          Plans
        </Button>
        <Button
          component={Link}
          to="/Workflows/Workflows"
          variant="contained"
          startIcon={<ServerCog />}
          sx={{ width: 150, height: 50 }}
        >
          Workflows
        </Button>
      </Stack>
    </Container>
  );
};

export default Dashboard;
