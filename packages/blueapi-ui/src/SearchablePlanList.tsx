import {
  Box,
  List,
  ListItemButton,
  TextField,
  Typography,
} from "@mui/material";
import type { Plan } from "@atlas/blueapi";
import { useMemo, useState } from "react";

type Props = {
  plans: Plan[];
  selectedPlan: Plan | null;
  updateSelection: (plan: Plan) => void;
};
export default function SearchablePlanList({
  plans,
  selectedPlan,
  updateSelection,
}: Props) {
  const [query, setQuery] = useState<string>("");

  const matchingPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((plan) => plan.name.toLowerCase().includes(q));
  }, [plans, query]);

  return (
    <>
      <Box sx={{ px: 2, pt: 1, pb: 0 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Plans
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Run or queue predefined acquisition plans for this beamline.
        </Typography>
      </Box>
      <List disablePadding>
        <Box sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search plans"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
        {/* <Divider /> */}
        {matchingPlans.map((plan) => {
          const selected = selectedPlan?.name === plan.name;
          return (
            <ListItemButton
              key={plan.name}
              selected={selected}
              aria-selected={selected}
              onClick={() => updateSelection(plan)}
            >
              {plan.name}
            </ListItemButton>
          );
        })}
        {matchingPlans.length === 0 && plans.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No plans match “{query}”.
            </Typography>
          </Box>
        )}
      </List>
    </>
  );
}
