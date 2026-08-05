import { createAjv, Generate } from "@jsonforms/core";
import { Divider, Snackbar, Stack, Typography } from "@mui/material";
import type { workflowTemplateFragment$key } from "../../graphql/__generated__/workflowTemplateFragment.graphql";
import { useFragment } from "react-relay";
import { workflowTemplateFragment } from "../../graphql/workflowTemplateFragment";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { useState } from "react";
import type { JSONObject } from "../../utils/types";
import { VisitInput, type Visit } from "@diamondlightsource/sci-react-ui";
import type { ErrorObject } from "ajv";
import { Link } from "react-router-dom";

const SubmissionForm = ({
  template,
  onSubmit,
  visit,
}: {
  template: workflowTemplateFragment$key;
  onSubmit: (visit: Visit, parameters: object) => void;
  visit?: Visit;
}) => {
  const data = useFragment(workflowTemplateFragment, template);
  const validator = createAjv({ useDefaults: true, coerceTypes: true });
  const [parameters, setParameters] = useState<JSONObject>({});
  const [errors, setErrors] = useState<ErrorObject[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const onClick = (visit: Visit, parameters?: object) => {
    if (errors.length === 0) {
      onSubmit(visit, parameters ?? {});
      setSubmitted(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitted(false);
  };

  return (
    <Stack>
      <Typography variant="h4" align="center">
        {data.title}
      </Typography>
      <Typography variant="body1" align="center">
        {data.description}
      </Typography>
      <Typography variant="body1" align="center">
        Maintainer: {data.maintainer}
      </Typography>
      {data.repository && (
        <Typography variant="body1" align="center">
          <Link to={data.repository}>{data.repository}</Link>
        </Typography>
      )}
      <Divider />
      <JsonForms
        schema={data.arguments}
        uischema={data.uiSchema ?? Generate.uiSchema(data.arguments)}
        renderers={materialRenderers}
        cells={materialCells}
        data={parameters}
        ajv={validator}
        onChange={({ data, errors }) => {
          setParameters(data as JSONObject);
          setErrors(errors ? errors : []);
        }}
      />
      <VisitInput
        visit={visit}
        onSubmit={onClick}
        parameters={parameters}
        submitOnReturn={false}
      />
      <Snackbar
        open={submitted}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Workflow submitted!"
      />
    </Stack>
  );
};

export default SubmissionForm;
