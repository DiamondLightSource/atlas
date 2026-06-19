import { useState, type ReactNode } from "react";
import type { Plan } from "@atlas/blueapi";
import {
  Box,
  Container,
  Grid2 as Grid,
  Paper,
  Typography,
} from "@mui/material";
import SearchablePlanList from "./SearchablePlanList";

export type PlanBrowserProps = {
  plans: Plan[];
  renderPlan: (plan: Plan) => ReactNode;
};

export function PlanBrowser({ plans, renderPlan }: PlanBrowserProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <Container sx={{ height: "85vh", width: "80%" }}>
      <Grid container spacing={0} sx={{ height: "100%" }}>
        <Grid size={{ xs: 4 }}>
          <Paper elevation={0} sx={{ height: "100%" }}>
            <SearchablePlanList
              plans={plans}
              selectedPlan={selectedPlan}
              updateSelection={setSelectedPlan}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Paper
            elevation={2}
            sx={{
              height: "100%",
              p: 2,
              display: "flex",
            }}
          >
            {selectedPlan ? (
              <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                {renderPlan(selectedPlan)}
              </Box>
            ) : (
              <Box sx={{ m: "auto", textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  Select a plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose from the list on the left to see details.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
