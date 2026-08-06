/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type GetContainersForInstrumentQueryVariables = Exact<{
  instrumentKeys?: Array<string> | string | null | undefined;
}>;


export type GetContainersForInstrumentQuery = { containers: { __typename: 'ContainerConnection', edges: Array<{ __typename: 'ContainerEdge', node: { __typename: 'Container', id: unknown, name: string, barcode: string | null, type: { __typename: 'ContainerType', name: string, numberOfContainerPositions: number | null }, instrumentSessions: Array<{ __typename: 'InstrumentSession', instrumentSessionReference: string | null }>, parent: { __typename: 'Container', name: string, id: unknown } | null, positionInParent: { __typename: 'ContainerPosition', position: number | null } | null } }> } };
