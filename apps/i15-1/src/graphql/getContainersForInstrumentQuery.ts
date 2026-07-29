import { gql } from "@apollo/client";

export const getContainersForInstrumentQuery = gql`
  query GetContainersForInstrument($instrumentKeys: [String!]) {
    containers(instrumentKeys: $instrumentKeys) {
      edges {
        node {
          id
          name
          barcode
          type {
            name
          }
          instrumentSessions {
            instrumentSessionReference
          }
          parent {
            name
            id
          }
          positionInParent {
            position
          }
        }
      }
    }
  }
`;
