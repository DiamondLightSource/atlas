/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AddPuckToTableMutationVariables = Exact<{
  puckId: unknown;
  tableId: unknown;
  position: number;
}>;


export type AddPuckToTableMutation = { container: { __typename: 'ContainerMutations', setParentContainer: { __typename: 'SetParentContainerResponse', success: boolean } } };
