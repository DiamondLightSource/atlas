import { gql } from "@apollo/client";

export const getSessionPlaylistQuery = gql`
  query GetSessionPlaylist(
    $proposal: Int!
    $session: Int!
    $first: Int!
    $after: String
  ) {
    experiments(
      first: $first
      after: $after
      instrumentSessions: {
        proposalNumber: $proposal
        instrumentSessionNumber: $session
      }
    ) {
      edges {
        cursor
        node {
          name
          sample {
            container {
              id
              positionInParent {
                position
              }
              parent {
                id
                name
              }
            }
            positionInContainer {
              position
            }
            name
            id
            data
            instrumentSessions {
              instrumentSessionReference
            }
          }
          experimentDefinition {
            name
            id
            data
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
