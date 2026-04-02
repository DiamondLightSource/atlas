import { visitToText, type Visit } from "@diamondlightsource/sci-react-ui";
import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { InstrumentSessionQuery as InstrumentSessionQueryType } from "./__generated__/InstrumentSessionQuery.graphql";

const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentName: String!) {
    instrument(instrumentName: $instrumentName) {
      instrumentSessions {
        instrumentSessionNumber
        state
        proposal {
          proposalCategory
          proposalNumber
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

  const sessionListLen = data.instrument?.instrumentSessions.length ?? 1;
  const sessionsList = [];

  for (let i = 0; i < sessionListLen; i++) {
    if (
      data.instrument?.instrumentSessions[i].state == "In Progress" ||
      data.instrument?.instrumentSessions[i].state == "Future"
    ) {
      const visit: Visit = {
        proposalCode:
          data.instrument?.instrumentSessions[
            i
          ].proposal?.proposalCategory?.toLowerCase() ?? "cm",
        proposalNumber:
          data.instrument?.instrumentSessions[i].proposal?.proposalNumber ??
          12345,
        number:
          data.instrument?.instrumentSessions[i].instrumentSessionNumber ?? 1,
      };
      sessionsList.push(visitToText(visit));
    }
  }
  return sessionsList;
}

export default GetInstrumentSessions;
