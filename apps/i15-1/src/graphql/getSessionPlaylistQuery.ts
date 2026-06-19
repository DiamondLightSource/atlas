import { gql } from "@apollo/client";

export const getSessionPlaylistQuery = gql`
  query GetSessionPlaylist($proposal: Int!, $session: Int!) {
    instrumentSession(
      proposalNumber: $proposal
      instrumentSessionNumber: $session
    ) {
      experiments {
        edges {
          node {
            name
            sample {
              name
              data
            }
            experimentDefinition {
              name
              data
            }
          }
        }
      }
    }
  }
`;
