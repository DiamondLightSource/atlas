/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RemovePuckFromTableMutationVariables = Exact<{
  tableId: unknown;
  puckId: Array<unknown> | unknown;
}>;


export type RemovePuckFromTableMutation = { container: { __typename: 'ContainerMutations', removeContainersFromContainer: { __typename: 'RemoveContainersFromContainerResponse', success: boolean } } };
