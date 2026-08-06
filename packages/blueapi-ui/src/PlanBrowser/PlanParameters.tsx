import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { sanitisePlan, type SchemaNode } from "../utils/schema";
import type { Plan } from "@atlas/blueapi";
import { RunPlanButton } from "../RunPlanButton";
import { useInstrumentSession } from "@atlas/app-shell";

import { ErrorBoundary } from "react-error-boundary";

/**
 * If the UI generation fails, we show a simple apology
 * TODO: This should instead be a JSON editor,
 * ideally with an initial JSON object derived from the selected plan's schema
 * See https://github.com/DiamondLightSource/atlas/issues/83
 */
function UIFallback() {
  return (
    <Typography component="h1" variant="h5">
      UI unavailable
    </Typography>
  );
}

interface PlansParameters {
  [key: string]: any;
}

export function PlanParameters({ plan }: { plan: Plan }) {
  const sanitisedPlan = sanitisePlan(plan);

  const [planParameters, setPlanParameters] = useState<PlansParameters>({});
  const { instrumentSession } = useInstrumentSession();

  return (
    <ErrorBoundary FallbackComponent={UIFallback} resetKeys={[plan.name]}>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          {plan.name}
        </Typography>
        {plan.description && (
          <Typography pt={2} pb={4}>
            {plan.description}
          </Typography>
        )}
        {(sanitisedPlan.schema as SchemaNode).skip ? (
          <UIFallback />
        ) : (
          <JsonForms
            schema={sanitisedPlan.schema}
            data={planParameters[plan.name]}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={({ data }) =>
              setPlanParameters({ ...planParameters, [plan.name]: data })
            }
          />
        )}
      </Box>
      <Box sx={{ mt: 2 }}>
        <RunPlanButton
          name={plan.name}
          params={planParameters[plan.name]}
          instrumentSession={instrumentSession}
        />
      </Box>
    </ErrorBoundary>
  );
}
