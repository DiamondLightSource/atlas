import { Suspense } from "react";
import { Container, Box } from "@mui/material";
import TemplateView from "../components/workflows/TemplateView";

const Workflows: React.FC = () => {
  return (
    <>
      <Container maxWidth="xl">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={2}
          mb={10}
        >
          <Suspense>
            <TemplateView templateName={"visr-reconstruction"} />
          </Suspense>
        </Box>
      </Container>
    </>
  );
};

export default Workflows;
