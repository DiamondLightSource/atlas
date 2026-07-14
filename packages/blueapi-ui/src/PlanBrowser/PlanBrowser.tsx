import { useState } from "react";
import type { Plan } from "@atlas/blueapi";
import { Box, Grid2 as Grid, Paper, Typography } from "@mui/material";
import SearchablePlanList from "./SearchablePlanList";
import { usePlans } from "@atlas/blueapi-query";
import { PlanParameters } from "./PlanParameters";

export function PlanBrowser() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data } = usePlans();
  const plans = data ? data.plans : [];

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 4 }}>
          <Paper>
            <SearchablePlanList
              plans={plans.sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                  sensitivity: "base",
                }),
              )}
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
                <PlanParameters plan={selectedPlan} />
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
    </Box>
  );
}
