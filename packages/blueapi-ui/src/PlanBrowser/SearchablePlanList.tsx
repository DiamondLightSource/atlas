import {
  Box,
  List,
  ListItemButton,
  Paper,
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
    return plans.filter(plan => plan.name.toLowerCase().includes(q));
  }, [plans, query]);

  return (
    <Box>
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          label="Search plans"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </Box>
      <Box
        sx={{
          px: 1.5,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            height: "85vh",
            overflowY: "auto",
            overscrollBehavior:
              "contain" /* don't scroll parent when you scroll beyond limit */,
            scrollbarWidth: "thin",
          }}
        >
          <List disablePadding>
            {matchingPlans.map(plan => {
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
        </Box>
      </Box>
    </Box>
  );
}
