import { gql } from "@apollo/client";

export const addPuckToTableMutation = gql`
  mutation AddPuckToTable($puckId: UUID!, $tableId: UUID!, $position: Int!) {
    container(id: $puckId) {
      setParentContainer(
        input: {
          containerPosition: {
            parentContainerId: $tableId
            position: $position
          }
        }
      ) {
        success
      }
    }
  }
`;
