/**
 * @generated SignedSource<<44623b1875ca9e075b68b6222a7fb543>>
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
  readonly instrument: {
    readonly instrumentSessions: ReadonlyArray<{
      readonly instrumentSessionNumber: number;
      readonly proposal: {
        readonly proposalCategory: string | null | undefined;
        readonly proposalNumber: number;
      } | null | undefined;
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
        "name": "instrumentName",
        "variableName": "instrumentName"
      }
    ],
    "concreteType": "Instrument",
    "kind": "LinkedField",
    "name": "instrument",
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
            "name": "instrumentSessionNumber",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Proposal",
            "kind": "LinkedField",
            "name": "proposal",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "proposalCategory",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "proposalNumber",
                "storageKey": null
              }
            ],
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
    "cacheID": "0fd5a212ca97751f6ddc9c1cdd801979",
    "id": null,
    "metadata": {},
    "name": "InstrumentSessionQuery",
    "operationKind": "query",
    "text": "query InstrumentSessionQuery(\n  $instrumentName: String!\n) {\n  instrument(instrumentName: $instrumentName) {\n    instrumentSessions {\n      instrumentSessionNumber\n      state\n      proposal {\n        proposalCategory\n        proposalNumber\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5de2b65b410c0ad26c8721ba04010220";

export default node;
