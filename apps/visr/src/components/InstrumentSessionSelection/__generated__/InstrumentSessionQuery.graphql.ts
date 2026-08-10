/**
 * @generated SignedSource<<884fd4b9106f6a2bb765d31609ddc5b7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InstrumentSessionQuery$variables = {
  instrumentName: string;
};
export type InstrumentSessionQuery$data = {
  readonly instrumentByName: {
    readonly instrumentSessions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly instrumentSessionReference: string | null | undefined;
          readonly state: string | null | undefined;
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
    "name": "instrumentName"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "instrumentName"
      }
    ],
    "concreteType": "Instrument",
    "kind": "LinkedField",
    "name": "instrumentByName",
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "state",
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
    "cacheID": "bab6e35bf24e1dc8d524a73fdc23c1c6",
    "id": null,
    "metadata": {},
    "name": "InstrumentSessionQuery",
    "operationKind": "query",
    "text": "query InstrumentSessionQuery(\n  $instrumentName: String!\n) {\n  instrumentByName(name: $instrumentName) {\n    instrumentSessions(filterBy: {state: {eq: IN_PROGRESS}}) {\n      edges {\n        node {\n          instrumentSessionReference\n          state\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f0e5cfab393260f9e9c4cd50d10a2f19";

export default node;
