import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { InstrumentSessionQuery as InstrumentSessionQueryType } from "./__generated__/InstrumentSessionQuery.graphql";

import { useAuth } from "@atlas/auth";

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

export function useInstrumentSessions() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    const data = useLazyLoadQuery<InstrumentSessionQueryType>(
      instrumentSessionQuery,
      { instrumentKey: "B01-1" },
    );
    return (
      data.instrumentByKey?.instrumentSessions.edges
        .map(edge => edge.node.instrumentSessionReference?.toLowerCase())
        .filter((session): session is string => session !== undefined) ?? []
    );
  } else {
    return [];
  }
}
