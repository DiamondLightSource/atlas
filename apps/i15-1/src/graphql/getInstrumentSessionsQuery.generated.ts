/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type InstrumentSessionQueryVariables = Exact<{
  instrumentKey: string;
}>;


export type InstrumentSessionQuery = { instrumentByKey: { __typename: 'Instrument', instrumentSessions: { __typename: 'InstrumentSessionConnection', edges: Array<{ __typename: 'InstrumentSessionEdge', node: { __typename: 'InstrumentSession', instrumentSessionReference: string | null } }> } } | null };
