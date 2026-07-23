/**
 * @generated SignedSource<<9f36acc75fb37c686d8aef477c812c01>>
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
    readonly instrumentSessions: ReadonlyArray<{
      readonly instrumentSessionReference: string | null | undefined;
      readonly state: string | null | undefined;
    }>;
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
        "args": null,
        "concreteType": "InstrumentSession",
        "kind": "LinkedField",
        "name": "instrumentSessions",
        "plural": true,
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
    "cacheID": "a04aa356857de97c58e11e861e1b53df",
    "id": null,
    "metadata": {},
    "name": "InstrumentSessionQuery",
    "operationKind": "query",
    "text": "query InstrumentSessionQuery(\n  $instrumentName: String!\n) {\n  instrumentByName(name: $instrumentName) {\n    instrumentSessions {\n      instrumentSessionReference\n      state\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "72ef04fa18d968be31c314c0aa6a7011";

export default node;
