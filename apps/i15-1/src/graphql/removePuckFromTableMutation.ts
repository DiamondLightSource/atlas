import { gql } from "@apollo/client";

export const removePuckFromTableMutation = gql`
  mutation RemovePuckFromTable($tableId: UUID!, $puckId: [UUID!]!) {
    container(id: $tableId) {
      removeContainersFromContainer(input: { containerIds: $puckId }) {
        success
      }
    }
  }
`;
