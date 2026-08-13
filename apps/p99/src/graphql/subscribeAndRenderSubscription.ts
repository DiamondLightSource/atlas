import { graphql } from "relay-runtime";

export const subscribeAndRenderSubscription = graphql`
  subscription subscribeAndRenderSubscription(
    $visit: VisitInput!
    $name: String!
  ) {
    workflow(visit: $visit, name: $name) {
      ...renderSubmittedMessageFragment
    }
  }
`;
