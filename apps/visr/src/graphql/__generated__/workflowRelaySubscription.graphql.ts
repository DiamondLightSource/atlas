/**
 * @generated SignedSource<<5a0b07d926ad9c65f9da31b788c35bba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TaskStatus = "ERROR" | "FAILED" | "OMITTED" | "PENDING" | "RUNNING" | "SKIPPED" | "SUCCEEDED" | "%future added value";
export type VisitInput = {
  number: number;
  proposalCode: string;
  proposalNumber: number;
};
export type workflowRelaySubscription$variables = {
  name: string;
  visit: VisitInput;
};
export type workflowRelaySubscription$data = {
  readonly workflow: {
    readonly name: string;
    readonly parameters: any | null | undefined;
    readonly status: {
      readonly __typename: "WorkflowErroredStatus";
      readonly endTime: any;
      readonly message: string | null | undefined;
      readonly startTime: any;
      readonly tasks: ReadonlyArray<{
        readonly artifacts: ReadonlyArray<{
          readonly mimeType: string;
          readonly name: string;
          readonly url: any;
        }>;
        readonly dependencies: ReadonlyArray<string>;
        readonly depends: ReadonlyArray<string>;
        readonly id: string;
        readonly message: string | null | undefined;
        readonly name: string;
        readonly status: TaskStatus;
        readonly stepType: string;
      }>;
    } | {
      readonly __typename: "WorkflowFailedStatus";
      readonly endTime: any;
      readonly message: string | null | undefined;
      readonly startTime: any;
      readonly tasks: ReadonlyArray<{
        readonly artifacts: ReadonlyArray<{
          readonly mimeType: string;
          readonly name: string;
          readonly url: any;
        }>;
        readonly dependencies: ReadonlyArray<string>;
        readonly depends: ReadonlyArray<string>;
        readonly id: string;
        readonly message: string | null | undefined;
        readonly name: string;
        readonly status: TaskStatus;
        readonly stepType: string;
      }>;
    } | {
      readonly __typename: "WorkflowPendingStatus";
      readonly message: string | null | undefined;
    } | {
      readonly __typename: "WorkflowRunningStatus";
      readonly message: string | null | undefined;
      readonly startTime: any;
      readonly tasks: ReadonlyArray<{
        readonly artifacts: ReadonlyArray<{
          readonly mimeType: string;
          readonly name: string;
          readonly url: any;
        }>;
        readonly dependencies: ReadonlyArray<string>;
        readonly depends: ReadonlyArray<string>;
        readonly id: string;
        readonly message: string | null | undefined;
        readonly name: string;
        readonly status: TaskStatus;
        readonly stepType: string;
      }>;
    } | {
      readonly __typename: "WorkflowSucceededStatus";
      readonly endTime: any;
      readonly message: string | null | undefined;
      readonly startTime: any;
      readonly tasks: ReadonlyArray<{
        readonly artifacts: ReadonlyArray<{
          readonly mimeType: string;
          readonly name: string;
          readonly url: any;
        }>;
        readonly dependencies: ReadonlyArray<string>;
        readonly depends: ReadonlyArray<string>;
        readonly id: string;
        readonly message: string | null | undefined;
        readonly name: string;
        readonly status: TaskStatus;
        readonly stepType: string;
      }>;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined;
    readonly templateRef: string | null | undefined;
    readonly visit: {
      readonly number: number;
      readonly proposalCode: string;
      readonly proposalNumber: number;
    };
  };
};
export type workflowRelaySubscription = {
  response: workflowRelaySubscription$data;
  variables: workflowRelaySubscription$variables;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startTime",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "Task",
  "kind": "LinkedField",
  "name": "tasks",
  "plural": true,
  "selections": [
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "depends",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dependencies",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "stepType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Artifact",
      "kind": "LinkedField",
      "name": "artifacts",
      "plural": true,
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "mimeType",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = [
  (v4/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "endTime",
    "storageKey": null
  },
  (v3/*: any*/),
  (v5/*: any*/)
],
v7 = [
  {
    "alias": null,
    "args": [
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
    ],
    "concreteType": "Workflow",
    "kind": "LinkedField",
    "name": "workflow",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Visit",
        "kind": "LinkedField",
        "name": "visit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "proposalCode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "proposalNumber",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "number",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateRef",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "parameters",
        "storageKey": null
      },
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
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "WorkflowPendingStatus",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v3/*: any*/),
              (v5/*: any*/)
            ],
            "type": "WorkflowRunningStatus",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v6/*: any*/),
            "type": "WorkflowSucceededStatus",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v6/*: any*/),
            "type": "WorkflowFailedStatus",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v6/*: any*/),
            "type": "WorkflowErroredStatus",
            "abstractKey": null
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "workflowRelaySubscription",
    "selections": (v7/*: any*/),
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
    "name": "workflowRelaySubscription",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "6ed1b132e2e60d23c7f960a4d13b549f",
    "id": null,
    "metadata": {},
    "name": "workflowRelaySubscription",
    "operationKind": "subscription",
    "text": "subscription workflowRelaySubscription(\n  $visit: VisitInput!\n  $name: String!\n) {\n  workflow(visit: $visit, name: $name) {\n    name\n    visit {\n      proposalCode\n      proposalNumber\n      number\n    }\n    templateRef\n    parameters\n    status {\n      __typename\n      ... on WorkflowPendingStatus {\n        message\n      }\n      ... on WorkflowRunningStatus {\n        startTime\n        message\n        tasks {\n          message\n          id\n          name\n          status\n          depends\n          dependencies\n          stepType\n          artifacts {\n            name\n            url\n            mimeType\n          }\n        }\n      }\n      ... on WorkflowSucceededStatus {\n        startTime\n        endTime\n        message\n        tasks {\n          message\n          id\n          name\n          status\n          depends\n          dependencies\n          stepType\n          artifacts {\n            name\n            url\n            mimeType\n          }\n        }\n      }\n      ... on WorkflowFailedStatus {\n        startTime\n        endTime\n        message\n        tasks {\n          message\n          id\n          name\n          status\n          depends\n          dependencies\n          stepType\n          artifacts {\n            name\n            url\n            mimeType\n          }\n        }\n      }\n      ... on WorkflowErroredStatus {\n        startTime\n        endTime\n        message\n        tasks {\n          message\n          id\n          name\n          status\n          depends\n          dependencies\n          stepType\n          artifacts {\n            name\n            url\n            mimeType\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6466b2fb82367cd38c0ddb125c11c884";

export default node;
