import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import sanitizeSchema from "./utils/schema";
import type { Plan } from "@atlas/blueapi";
import { RunPlanButton } from "./RunPlanButton";

import { ErrorBoundary } from "react-error-boundary";

/**
 * If the UI generation fails, we show a simple apology
 */
function UIFallback() {
  return (
    <Typography component="h1" variant="h5">
      UI unavailable
    </Typography>
  );
}
type PlanParametersProps = {
  plan: Plan;
};

export const PlanParameters: React.FC<PlanParametersProps> = (
  props: PlanParametersProps,
) => {
  const schema = sanitizeSchema(props.plan.schema);

  const [planParameters, setPlanParameters] = useState({});
  // TODO: Remove InstrumentSession box and state, retrieve from context when submitting.
  //       See https://github.com/DiamondLightSource/atlas/issues/57
  const [instrumentSession, setInstrumentSession] = useState("cm12345-1");

  return (
    <ErrorBoundary FallbackComponent={UIFallback} resetKeys={[props.plan.name]}>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          {props.plan.name}
        </Typography>
        {props.plan.description && (
          <Typography pt={2} pb={4}>
            {props.plan.description}
          </Typography>
        )}
        <JsonForms
          schema={schema}
          data={planParameters}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data }) => setPlanParameters(data)}
        />
      </Box>
      {/* TODO: Remove InstrumentSession box and state, retrieve from context when submitting.
                See https://github.com/DiamondLightSource/atlas/issues/57 */}
      <Box sx={{ mt: 2 }}>
        <TextField
          id="instrumentSession"
          label="Instrument Session"
          defaultValue={instrumentSession}
          onChange={(e) => setInstrumentSession(e.target.value)}
        ></TextField>
      </Box>
      <Box sx={{ mt: 2 }}>
        <RunPlanButton
          name={props.plan.name}
          params={planParameters}
          instrumentSession={instrumentSession}
        />
      </Box>
    </ErrorBoundary>
  );
};
