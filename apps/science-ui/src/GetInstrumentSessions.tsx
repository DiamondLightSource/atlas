import { InstrumentSessionProvider } from "@atlas/app-shell";
import { type PropsWithChildren } from "react";
import { graphql } from "relay-runtime";
import { useLazyLoadQuery } from "react-relay/hooks";
import type { GetInstrumentSessionsQuery as InstrumentQuery } from "./__generated__/GetInstrumentSessionsQuery.graphql";

const instrumentSessionQuery = graphql`
  query GetInstrumentSessionsQuery($instrumentKey: String!) {
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

type Props = { beamline: string } & PropsWithChildren;

export function GetInstrumentSessions(props: Props) {
  const data = useLazyLoadQuery<InstrumentQuery>(instrumentSessionQuery, {
    instrumentKey: props.beamline,
  });

  const visits =
    data.instrumentByKey?.instrumentSessions.edges
      .map(edge => edge.node.instrumentSessionReference?.toLowerCase())
      .filter((session): session is string => session !== undefined) ?? [];

  return (
    <InstrumentSessionProvider sessionsList={visits}>
      {props.children}
    </InstrumentSessionProvider>
  );
}
