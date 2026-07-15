import { useState } from "react";
import type { Plan } from "@atlas/blueapi";
import {
  Box,
  Button,
  Drawer,
  Grid2 as Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchablePlanList from "./SearchablePlanList";
import { usePlans } from "@atlas/blueapi-query";
import { PlanParameters } from "./PlanParameters";
import { LucideArrowRight } from "lucide-react";

type Props = {
  plans: Plan[];
  selected: Plan | null;
  select: (plan: Plan) => void;
};

function CompactLayout({ plans, selected, select }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Box>
      <Drawer variant="temporary" open={open} onClose={() => setOpen(false)}>
        <Toolbar />
        <Paper>
          <SearchablePlanList
            plans={plans}
            selectedPlan={selected}
            updateSelection={select}
          />
        </Paper>
      </Drawer>
      <Paper
        elevation={2}
        sx={{
          height: "100%",
          p: 2,
          display: "flex",
        }}
      >
        <Stack>
          <Box>
            <Button
              endIcon={<LucideArrowRight />}
              onClick={() => setOpen(true)}
            >
              View plans
            </Button>
          </Box>
          <PlanParametersWrapper selected={selected} />
        </Stack>
      </Paper>
    </Box>
  );
}

function PlanParametersWrapper({ selected }: { selected: Plan | null }) {
  return (
    <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
      {selected ? (
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <PlanParameters plan={selected} />
        </Box>
      ) : (
        <Box sx={{ m: "auto", textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Select a plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose from the list to see details.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function FullLayout({ plans, selected, select }: Props) {
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
              selectedPlan={selected}
              updateSelection={select}
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
            <PlanParametersWrapper selected={selected} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export function PlanBrowser() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data } = usePlans();
  const plans = data
    ? data.plans.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        }),
      )
    : [];

  const theme = useTheme();
  const bigEnoughForFullLayout = useMediaQuery(theme.breakpoints.up("md"));

  if (bigEnoughForFullLayout) {
    return (
      <FullLayout
        plans={plans}
        selected={selectedPlan}
        select={setSelectedPlan}
      />
    );
  }
  return (
    <CompactLayout
      plans={plans}
      selected={selectedPlan}
      select={setSelectedPlan}
    />
  );
}
