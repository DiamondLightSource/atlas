import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { InstrumentSessionQuery as InstrumentSessionQueryType } from "./__generated__/InstrumentSessionQuery.graphql";

// TODO: Filter query client side
// https://github.com/DiamondLightSource/atlas/issues/81
const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentName: String!) {
  instrumentByName(name: $instrumentName) {
    instrumentSessions(filterBy: {state: {eq: IN_PROGRESS}}) {
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

function GetInstrumentSessions() {
  const data = useLazyLoadQuery<InstrumentSessionQueryType>(
    instrumentSessionQuery,
    { instrumentName: "ViSR" },
  );

  const sessionListLen = data.instrumentByName?.instrumentSessions.length ?? 1;
  const sessionsList = [];

  for (let i = 0; i < sessionListLen; i++) {
    sessionsList.push(
      data.instrumentByName?.instrumentSessions[
        i
      ].instrumentSessionReference?.toLowerCase(),
    );
  }
  return sessionsList;
}

export default GetInstrumentSessions;
