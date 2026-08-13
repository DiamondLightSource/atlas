/**
 * @generated SignedSource<<bd1b8135caeb17d19bce04484c0b8df1>>
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
export type subscribeAndRenderSubscription$variables = {
  name: string;
  visit: VisitInput;
};
export type subscribeAndRenderSubscription$data = {
  readonly workflow: {
    readonly " $fragmentSpreads": FragmentRefs<"renderSubmittedMessageFragment">;
  };
};
export type subscribeAndRenderSubscription = {
  response: subscribeAndRenderSubscription$data;
  variables: subscribeAndRenderSubscription$variables;
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
    "name": "subscribeAndRenderSubscription",
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
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "subscribeAndRenderSubscription",
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
    "cacheID": "1ca97628bb694c4d5fe00452a2a1d3f8",
    "id": null,
    "metadata": {},
    "name": "subscribeAndRenderSubscription",
    "operationKind": "subscription",
    "text": "subscription subscribeAndRenderSubscription(\n  $visit: VisitInput!\n  $name: String!\n) {\n  workflow(visit: $visit, name: $name) {\n    ...renderSubmittedMessageFragment\n    id\n  }\n}\n\nfragment renderSubmittedMessageFragment on Workflow {\n  status {\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "c3057cb3b2ce67c2a8d0cf51ff221958";

export default node;
