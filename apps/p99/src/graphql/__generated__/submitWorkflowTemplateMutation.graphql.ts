/**
 * @generated SignedSource<<1bf0edfd66484b0fb05d16638676a62b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VisitInput = {
  number: number;
  proposalCode: string;
  proposalNumber: number;
};
export type submitWorkflowTemplateMutation$variables = {
  parameters: any;
  templateName: string;
  visit: VisitInput;
};
export type submitWorkflowTemplateMutation$data = {
  readonly submitWorkflowTemplate: {
    readonly name: string;
  };
};
export type submitWorkflowTemplateMutation = {
  response: submitWorkflowTemplateMutation$data;
  variables: submitWorkflowTemplateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "parameters"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "templateName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visit"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "templateName"
  },
  {
    "kind": "Variable",
    "name": "parameters",
    "variableName": "parameters"
  },
  {
    "kind": "Variable",
    "name": "visit",
    "variableName": "visit"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "submitWorkflowTemplateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "submitWorkflowTemplate",
        "plural": false,
        "selections": [
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "submitWorkflowTemplateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "submitWorkflowTemplate",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
    "cacheID": "4c13758cbc0d34e6d9a014c9f36e641a",
    "id": null,
    "metadata": {},
    "name": "submitWorkflowTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation submitWorkflowTemplateMutation(\n  $templateName: String!\n  $visit: VisitInput!\n  $parameters: JSON!\n) {\n  submitWorkflowTemplate(name: $templateName, visit: $visit, parameters: $parameters) {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e2ff0d748606ea7f1c8e6dd7daae9206";

export default node;
