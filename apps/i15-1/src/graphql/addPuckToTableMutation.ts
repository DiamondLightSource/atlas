import { gql } from "@apollo/client";

export const addPuckToTableMutation = gql`
  mutation AddPuckToTable($barcode: String!, $tableId: UUID!, $position: Int!) {
    container(barcode: $barcode) {
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
