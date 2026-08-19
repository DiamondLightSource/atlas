import { useLazyLoadQuery } from "react-relay/hooks";
import { Environment, fetchQuery, graphql } from "relay-runtime";
import type { InstrumentSessionQuery as InstrumentSessionQueryType } from "./__generated__/InstrumentSessionQuery.graphql";

const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentName: String!) {
    instrumentByName(name: $instrumentName) {
      instrumentSessions(filterBy: { state: { eq: IN_PROGRESS } }) {
        edges {
          node {
            instrumentSessionReference
            state
          }
        }
      }
    }
  }
`;

export function useInstrumentSessions() {
  const data = useLazyLoadQuery<InstrumentSessionQueryType>(
    instrumentSessionQuery,
    { instrumentName: "ViSR" },
  );

  return (
    data.instrumentByName?.instrumentSessions.edges
      .map(edge => edge.node.instrumentSessionReference?.toLowerCase())
      .filter((session): session is string => session !== undefined) ?? []
  );
}
