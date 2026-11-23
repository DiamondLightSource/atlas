import { Container } from "@mui/material";
import { Suspense } from "react";
import TemplateView from "../components/workflows/TemplateView";
import ErrorBoundary from "../components/workflows/ErrorBoundary";

const Workflows = () => (
  <Container maxWidth={false} sx={{ minHeight: "100vh", mt: 3, mb: 3 }}>
    <Suspense>
      <ErrorBoundary>
        <TemplateView templateName="ptypy-p99-nexus" />
      </ErrorBoundary>
    </Suspense>
  </Container>
);

export default Workflows;
