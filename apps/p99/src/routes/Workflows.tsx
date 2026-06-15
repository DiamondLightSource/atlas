import { Container } from "@mui/material";
import { Suspense } from "react";
import TemplateView from "../components/workflows/TemplateView";

const Workflows = () => (
  <Container maxWidth={false} sx={{ minHeight: "100vh", mt: 3, mb: 3 }}>
    <Suspense>
      <TemplateView templateName="ptypy-p99-from-config" />
    </Suspense>
  </Container>
);

export default Workflows;
