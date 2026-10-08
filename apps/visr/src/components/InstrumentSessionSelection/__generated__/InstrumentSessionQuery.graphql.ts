/**
 * @generated SignedSource<<5dff2581ece7924613793b9f78265aeb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InstrumentSessionQuery$variables = {
  instrumentKey: string;
};
export type InstrumentSessionQuery$data = {
  readonly instrumentByKey: {
    readonly instrumentSessions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly instrumentSessionReference: string | null | undefined;
        };
      }>;
    };
  } | null | undefined;
};
export type InstrumentSessionQuery = {
  response: InstrumentSessionQuery$data;
  variables: InstrumentSessionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "instrumentKey"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "key",
        "variableName": "instrumentKey"
      }
    ],
    "concreteType": "Instrument",
    "kind": "LinkedField",
    "name": "instrumentByKey",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "filterBy",
            "value": {
              "state": {
                "eq": "IN_PROGRESS"
              }
            }
          }
        ],
        "concreteType": "InstrumentSessionConnection",
        "kind": "LinkedField",
        "name": "instrumentSessions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "InstrumentSessionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "InstrumentSession",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "instrumentSessionReference",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "instrumentSessions(filterBy:{\"state\":{\"eq\":\"IN_PROGRESS\"}})"
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InstrumentSessionQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InstrumentSessionQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1945deec11f4074111def5152412e3ae",
    "id": null,
    "metadata": {},
    "name": "InstrumentSessionQuery",
    "operationKind": "query",
    "text": "query InstrumentSessionQuery(\n  $instrumentKey: String!\n) {\n  instrumentByKey(key: $instrumentKey) {\n    instrumentSessions(filterBy: {state: {eq: IN_PROGRESS}}) {\n      edges {\n        node {\n          instrumentSessionReference\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a0018996dc6aa614a92c4446328e1b8";

export default node;
