/**
 * @generated SignedSource<<a28aeb90cf12672c2f17ffe473d69e1d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubmissionFormTestQuery$variables = Record<PropertyKey, never>;
export type SubmissionFormTestQuery$data = {
  readonly workflowTemplate: {
    readonly " $fragmentSpreads": FragmentRefs<"workflowTemplateFragment">;
  };
};
export type SubmissionFormTestQuery = {
  response: SubmissionFormTestQuery$data;
  variables: SubmissionFormTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "ptypy-p99-from-config"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SubmissionFormTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "WorkflowTemplate",
        "kind": "LinkedField",
        "name": "workflowTemplate",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "workflowTemplateFragment"
          }
        ],
        "storageKey": "workflowTemplate(name:\"ptypy-p99-from-config\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SubmissionFormTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "WorkflowTemplate",
        "kind": "LinkedField",
        "name": "workflowTemplate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maintainer",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "arguments",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uiSchema",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "repository",
            "storageKey": null
          }
        ],
        "storageKey": "workflowTemplate(name:\"ptypy-p99-from-config\")"
      }
    ]
  },
  "params": {
    "cacheID": "4d401cb76dd7347f2e3f617f3b6170ae",
    "id": null,
    "metadata": {},
    "name": "SubmissionFormTestQuery",
    "operationKind": "query",
    "text": "query SubmissionFormTestQuery {\n  workflowTemplate(name: \"ptypy-p99-from-config\") {\n    ...workflowTemplateFragment\n  }\n}\n\nfragment workflowTemplateFragment on WorkflowTemplate {\n  name\n  maintainer\n  title\n  description\n  arguments\n  uiSchema\n  repository\n}\n"
  }
};
})();

(node as any).hash = "5bc0a249228ca92dcbce2d40e75ee1dd";

export default node;
