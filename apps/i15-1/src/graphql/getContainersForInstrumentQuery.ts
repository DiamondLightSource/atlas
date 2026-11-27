import { gql } from "@apollo/client";

export const getContainersForInstrumentQuery = gql`
  query GetContainersForInstrument($instrumentKeys: [String!]) {
    containers(instrumentKeys: $instrumentKeys, first:50) {
      edges {
        node {
          id
          name
          barcode
          type {
            name
            numberOfContainerPositions
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
