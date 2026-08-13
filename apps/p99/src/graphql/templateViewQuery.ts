import { graphql } from "relay-runtime";

export const templateViewQuery = graphql`
  query templateViewQuery($templateName: String!) {
    workflowTemplate(name: $templateName) {
      ...workflowTemplateFragment
    }
  }
`;
