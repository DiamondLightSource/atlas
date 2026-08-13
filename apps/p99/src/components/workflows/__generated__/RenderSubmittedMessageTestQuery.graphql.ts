/**
 * @generated SignedSource<<c731cfba30bed7d89bb2b7b626f8cc04>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VisitInput = {
  number: number;
  proposalCode: string;
  proposalNumber: number;
};
export type RenderSubmittedMessageTestQuery$variables = {
  name: string;
  visit: VisitInput;
};
export type RenderSubmittedMessageTestQuery$data = {
  readonly workflow: {
    readonly " $fragmentSpreads": FragmentRefs<"renderSubmittedMessageFragment">;
  };
};
export type RenderSubmittedMessageTestQuery = {
  response: RenderSubmittedMessageTestQuery$data;
  variables: RenderSubmittedMessageTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visit"
},
v2 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  },
  {
    "kind": "Variable",
    "name": "visit",
    "variableName": "visit"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RenderSubmittedMessageTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "workflow",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "renderSubmittedMessageFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RenderSubmittedMessageTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "workflow",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "status",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5ca78f304d1729649dbb93c2a951718a",
    "id": null,
    "metadata": {},
    "name": "RenderSubmittedMessageTestQuery",
    "operationKind": "query",
    "text": "query RenderSubmittedMessageTestQuery(\n  $visit: VisitInput!\n  $name: String!\n) {\n  workflow(visit: $visit, name: $name) {\n    ...renderSubmittedMessageFragment\n    id\n  }\n}\n\nfragment renderSubmittedMessageFragment on Workflow {\n  status {\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcee8b4885b894a415baa73e47a2a0ff";

export default node;
