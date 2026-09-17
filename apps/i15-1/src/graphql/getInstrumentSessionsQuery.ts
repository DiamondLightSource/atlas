import { gql } from "@apollo/client";

export const getInstrumentSessionsQuery = gql`
  query InstrumentSession($instrumentKey: String!) {
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
