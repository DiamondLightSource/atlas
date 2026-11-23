import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { InstrumentSessionQuery } from "./__generated__/InstrumentSessionQuery.graphql";

const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentKey: String!) {
    instrumentByKey(key: $instrumentKey) {
      instrumentSessions(filterBy: { state: { eq: IN_PROGRESS } }) {
        edges {
          node {
            instrumentSessionReference
          }
        }
      }
    }
  }
`;

export function useInstrumentSessions(beamline: string) {
  const data = useLazyLoadQuery<InstrumentSessionQuery>(
    instrumentSessionQuery,
    { instrumentKey: beamline },
  );

  return (
    data.instrumentByKey?.instrumentSessions.edges
      .map(edge => edge.node.instrumentSessionReference?.toLowerCase())
      .filter((session): session is string => session !== undefined) ?? []
  );
}
