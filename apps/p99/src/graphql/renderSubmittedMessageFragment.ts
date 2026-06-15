import { graphql } from "relay-runtime";

export const renderSubmittedMessageFragment = graphql`
  fragment renderSubmittedMessageFragment on Workflow {
    status {
      __typename
    }
  }
`;
