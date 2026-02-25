import { graphql, useFragment } from "react-relay";
import { type JSONObject, type Visit } from "../../utils/types";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import TemplateSubmissionForm from "./TemplateSubmissionForm";
import type { SubmissionFormFragment$key } from "./__generated__/SubmissionFormFragment.graphql";

export const SubmissionFormFragment = graphql`
  fragment SubmissionFormFragment on WorkflowTemplate {
    name
    maintainer
    title
    description
    arguments
    uiSchema
    repository
  }
`;

const SubmissionForm = (props: {
  template: SubmissionFormFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (visit: Visit, parameters: object) => void;
}) => {
  const data = useFragment(SubmissionFormFragment, props.template);
  return (
    <TemplateSubmissionForm
      title={data.title ? data.title : data.name}
      maintainer={data.maintainer}
      repository={data.repository}
      description={data.description ? data.description : undefined}
      parametersSchema={data.arguments as JsonSchema}
      parametersUISchema={data.uiSchema as UISchemaElement}
      visit={props.visit}
      prepopulatedParameters={props.prepopulatedParameters}
      onSubmit={props.onSubmit}
    />
  );
};

export default SubmissionForm;
