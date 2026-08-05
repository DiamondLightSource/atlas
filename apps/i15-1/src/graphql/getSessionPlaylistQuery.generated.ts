/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type GetSessionPlaylistQueryVariables = Exact<{
  proposal: number;
  session: number;
}>;


export type GetSessionPlaylistQuery = { experiments: { __typename: 'ExperimentConnection', edges: Array<{ __typename: 'ExperimentEdge', node: { __typename: 'Experiment', name: string, sample: { __typename: 'Sample', name: string, id: unknown, data: unknown, container: { __typename: 'Container', id: unknown, parent: { __typename: 'Container', id: unknown, name: string } | null } | null, instrumentSessions: Array<{ __typename: 'InstrumentSession', instrumentSessionReference: string | null }> }, experimentDefinition: { __typename: 'ExperimentDefinition', name: string, id: unknown, data: unknown } } }> } | null };
