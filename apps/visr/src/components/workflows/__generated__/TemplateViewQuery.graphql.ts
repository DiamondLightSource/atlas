/**
 * @generated SignedSource<<e10c8607833d1c312cb959334703846d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TemplateViewQuery$variables = {
  templateName: string;
};
export type TemplateViewQuery$data = {
  readonly workflowTemplate: {
    readonly " $fragmentSpreads": FragmentRefs<"SubmissionFormFragment">;
  };
};
export type TemplateViewQuery = {
  response: TemplateViewQuery$data;
  variables: TemplateViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "templateName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "templateName"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TemplateViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "WorkflowTemplate",
        "kind": "LinkedField",
        "name": "workflowTemplate",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SubmissionFormFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TemplateViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f7b70050ad93e97cf69ca8025a53c572",
    "id": null,
    "metadata": {},
    "name": "TemplateViewQuery",
    "operationKind": "query",
    "text": "query TemplateViewQuery(\n  $templateName: String!\n) {\n  workflowTemplate(name: $templateName) {\n    ...SubmissionFormFragment\n  }\n}\n\nfragment SubmissionFormFragment on WorkflowTemplate {\n  name\n  maintainer\n  title\n  description\n  arguments\n  uiSchema\n  repository\n}\n"
  }
};
})();

(node as any).hash = "4c702d8bfd75a5c741f542f85ff6f4a9";

export default node;
