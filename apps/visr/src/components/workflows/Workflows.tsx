import { Suspense } from "react";
import { Container, Box } from "@mui/material";
import TemplateView from "./TemplateView";

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
            <TemplateView templateName={"visr"} />
          </Suspense>
        </Box>
      </Container>
    </>
  );
};

export default Workflows;
