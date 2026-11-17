import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { InstrumentSessionQuery as InstrumentSessionQueryType } from "./__generated__/InstrumentSessionQuery.graphql";
import { useInstrumentSession } from "@atlas/app-shell";
import { Button } from "@mui/material";

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
  const data = useLazyLoadQuery<InstrumentSessionQueryType>(
    instrumentSessionQuery,
    { instrumentKey: "B01-1" },
  );

  return (
    data.instrumentByKey?.instrumentSessions.edges
      .map(edge => edge.node.instrumentSessionReference?.toLowerCase())
      .filter((session): session is string => session !== undefined) ?? []
  );
}

export const InstrumentSessionButton = () => {
  const { setInstrumentSession, setInstrumentSessionList } =
    useInstrumentSession();

  const fetchSessions = useInstrumentSessions().filter(
    (session): session is string => session !== undefined,
  );

  const handleButtonClick = async () => {
    try {
      const sessions = fetchSessions;
      if (sessions.length === 0) {
        sessions.push("0-0");
      }
      setInstrumentSessionList(sessions);
      if (sessions.length == 1) {
        setInstrumentSession(sessions[0]);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };
  return (
    <Button variant="contained" onClick={handleButtonClick}>
      Get Sessions
    </Button>
  );
};
