import { gql } from "@apollo/client";

export const getContainersForInstrumentQuery = gql`
  query GetContainersForInstrument($instrumentKeys: [String!]) {
    containers(instrumentKeys: $instrumentKeys) {
      edges {
        node {
          id
          name
          barcode
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
