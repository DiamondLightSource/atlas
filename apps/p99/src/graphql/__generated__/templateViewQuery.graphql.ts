/**
 * @generated SignedSource<<9ab71ee3d5f3ef84f6b6a375814b3d28>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type templateViewQuery$variables = {
  templateName: string;
};
export type templateViewQuery$data = {
  readonly workflowTemplate: {
    readonly " $fragmentSpreads": FragmentRefs<"workflowTemplateFragment">;
  };
};
export type templateViewQuery = {
  response: templateViewQuery$data;
  variables: templateViewQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "templateName",
      },
    ],
    v1 = [
      {
        kind: "Variable",
        name: "name",
        variableName: "templateName",
      },
    ];
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "templateViewQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "WorkflowTemplate",
          kind: "LinkedField",
          name: "workflowTemplate",
          plural: false,
          selections: [
            {
              args: null,
              kind: "FragmentSpread",
              name: "workflowTemplateFragment",
            },
          ],
          storageKey: null,
        },
      ],
      type: "Query",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "templateViewQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "WorkflowTemplate",
          kind: "LinkedField",
          name: "workflowTemplate",
          plural: false,
          selections: [
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "name",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "maintainer",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "title",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "description",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "arguments",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "uiSchema",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "repository",
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "19fc0d9ac63aa4eab9e10aefa178227c",
      id: null,
      metadata: {},
      name: "templateViewQuery",
      operationKind: "query",
      text: "query templateViewQuery(\n  $templateName: String!\n) {\n  workflowTemplate(name: $templateName) {\n    ...workflowTemplateFragment\n  }\n}\n\nfragment workflowTemplateFragment on WorkflowTemplate {\n  name\n  maintainer\n  title\n  description\n  arguments\n  uiSchema\n  repository\n}\n",
    },
  };
})();

(node as any).hash = "a095c2f1a9314457db4bf9b26bc541a2";

export default node;
