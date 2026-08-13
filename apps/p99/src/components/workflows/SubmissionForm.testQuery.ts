import { graphql } from "react-relay";

// Exists so tests can mint a real workflow template fragment key.
export const SubmissionFormTestQuery = graphql`
  query SubmissionFormTestQuery {
    workflowTemplate(name: "ptypy-p99-from-config") {
      ...workflowTemplateFragment
    }
  }
`;
