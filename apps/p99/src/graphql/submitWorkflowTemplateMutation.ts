import { graphql } from "relay-runtime";

export const mutation = graphql`
  mutation submitWorkflowTemplateMutation(
    $templateName: String!
    $visit: VisitInput!
    $parameters: JSON!
  ) {
    submitWorkflowTemplate(
      name: $templateName
      visit: $visit
      parameters: $parameters
    ) {
      name
    }
  }
`;
