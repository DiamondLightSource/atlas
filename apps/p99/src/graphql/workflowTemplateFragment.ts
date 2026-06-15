import { graphql } from "relay-runtime";

export const workflowTemplateFragment = graphql`
  fragment workflowTemplateFragment on WorkflowTemplate {
    name
    maintainer
    title
    description
    arguments
    uiSchema
    repository
  }
`;
