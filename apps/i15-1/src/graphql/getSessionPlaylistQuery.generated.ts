/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type GetSessionPlaylistQueryVariables = Exact<{
  proposal: number;
  session: number;
}>;


export type GetSessionPlaylistQuery = { instrumentSession: { __typename: 'InstrumentSession', experiments: { __typename: 'ExperimentConnection', edges: Array<{ __typename: 'ExperimentEdge', node: { __typename: 'Experiment', name: string, sample: { __typename: 'Sample', name: string, data: unknown }, experimentDefinition: { __typename: 'ExperimentDefinition', name: string, data: unknown } } }> } } | null };
