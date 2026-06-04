import { Container, Typography, Stack, Button } from "@mui/material";
import { FileText, ServerCog } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => (
  <Container maxWidth={false} sx={{ minHeight: "100vh", mt: 3, mb: 3 }}>
    <Stack direction="column" alignItems="center" spacing={3}>
      <Typography variant="h3">Welcome to P99!</Typography>
      <Button
        component={Link}
        to="plans"
        variant="contained"
        startIcon={<FileText />}
        sx={{ width: 150, height: 50 }}
      >
        Plans
      </Button>
      <Button
        component={Link}
        to="workflows"
        variant="contained"
        startIcon={<ServerCog />}
        sx={{ width: 150, height: 50 }}
      >
        Workflows
      </Button>
    </Stack>
  </Container>
);

export default Dashboard;
