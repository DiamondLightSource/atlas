/**
 * @generated SignedSource<<7d8cc9f1e81be3383dbd3bbc91b5c342>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type GetInstrumentSessionsQuery$variables = {
  instrumentKey: string;
};
export type GetInstrumentSessionsQuery$data = {
  readonly instrumentByKey:
    | {
        readonly instrumentSessions: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly instrumentSessionReference: string | null | undefined;
            };
          }>;
        };
      }
    | null
    | undefined;
};
export type GetInstrumentSessionsQuery = {
  response: GetInstrumentSessionsQuery$data;
  variables: GetInstrumentSessionsQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "instrumentKey",
      },
    ],
    v1 = [
      {
        alias: null,
        args: [
          {
            kind: "Variable",
            name: "key",
            variableName: "instrumentKey",
          },
        ],
        concreteType: "Instrument",
        kind: "LinkedField",
        name: "instrumentByKey",
        plural: false,
        selections: [
          {
            alias: null,
            args: [
              {
                kind: "Literal",
                name: "filterBy",
                value: {
                  state: {
                    eq: "IN_PROGRESS",
                  },
                },
              },
            ],
            concreteType: "InstrumentSessionConnection",
            kind: "LinkedField",
            name: "instrumentSessions",
            plural: false,
            selections: [
              {
                alias: null,
                args: null,
                concreteType: "InstrumentSessionEdge",
                kind: "LinkedField",
                name: "edges",
                plural: true,
                selections: [
                  {
                    alias: null,
                    args: null,
                    concreteType: "InstrumentSession",
                    kind: "LinkedField",
                    name: "node",
                    plural: false,
                    selections: [
                      {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "instrumentSessionReference",
                        storageKey: null,
                      },
                    ],
                    storageKey: null,
                  },
                ],
                storageKey: null,
              },
            ],
            storageKey:
              'instrumentSessions(filterBy:{"state":{"eq":"IN_PROGRESS"}})',
          },
        ],
        storageKey: null,
      },
    ];
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "GetInstrumentSessionsQuery",
      selections: v1 /*: any*/,
      type: "Query",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "GetInstrumentSessionsQuery",
      selections: v1 /*: any*/,
    },
    params: {
      cacheID: "2d6205c5a18a86cd180010570146212a",
      id: null,
      metadata: {},
      name: "GetInstrumentSessionsQuery",
      operationKind: "query",
      text: "query GetInstrumentSessionsQuery(\n  $instrumentKey: String!\n) {\n  instrumentByKey(key: $instrumentKey) {\n    instrumentSessions(filterBy: {state: {eq: IN_PROGRESS}}) {\n      edges {\n        node {\n          instrumentSessionReference\n        }\n      }\n    }\n  }\n}\n",
    },
  };
})();

(node as any).hash = "9b0eba750d69f929b29a8e7af971a164";

export default node;
