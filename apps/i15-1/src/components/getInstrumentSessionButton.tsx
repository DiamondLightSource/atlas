import { useLazyQuery } from "@apollo/client/react";
import { getInstrumentSessionsQuery } from "../graphql/getInstrumentSessionsQuery.ts";
import type { TypedDocumentNode } from "@apollo/client";
import type {
  InstrumentSessionQuery,
  InstrumentSessionQueryVariables,
} from "../graphql/getInstrumentSessionsQuery.generated.ts";
import { useInstrumentSession } from "@atlas/app-shell";
import { Button } from "@mui/material";

export const InstrumentSessionButton = () => {
  const { setInstrumentSessionList } = useInstrumentSession();

  const GET_SESSIONS: TypedDocumentNode<
    InstrumentSessionQuery,
    InstrumentSessionQueryVariables
  > = getInstrumentSessionsQuery;

  const [fetchSessions, { loading, error }] = useLazyQuery(GET_SESSIONS);

  const handleButtonClick = async () => {
    try {
      const { data } = await fetchSessions({
        variables: { instrumentKey: "I15-1" },
      });

      const edges = data?.instrumentByKey?.instrumentSessions?.edges;
      if (edges && edges.length > 0) {
        const sessionsList = edges.flatMap((edge) => {
          const ref = edge?.node?.instrumentSessionReference;
          return ref ? [ref.toLocaleLowerCase()] : [];
        });
        setInstrumentSessionList(sessionsList);
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
