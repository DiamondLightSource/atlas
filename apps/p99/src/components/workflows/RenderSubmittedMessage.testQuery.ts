import { graphql } from "react-relay";

export const RenderSubmittedMessageTestQuery = graphql`
  query RenderSubmittedMessageTestQuery($visit: VisitInput!, $name: String!) {
    workflow(visit: $visit, name: $name) {
      ...renderSubmittedMessageFragment
    }
  }
`;
