import { gql } from "@apollo/client";

export const getSessionPlaylistQuery = gql`
  query GetSessionPlaylist($proposal: Int!, $session: Int!) {
    experiments(
      instrumentSessions: {
        proposalNumber: $proposal
        instrumentSessionNumber: $session
      }
    ) {
      edges {
        node {
          name
          sample {
            container {
              id
              parent {
                id
                name
              }
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
    }
  }
`;
