/**
 * @generated SignedSource<<7eb6c59915242a110bb98268ee6f12dc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type workflowTemplateFragment$data = {
  readonly arguments: any;
  readonly description: string | null | undefined;
  readonly maintainer: string;
  readonly name: string;
  readonly repository: string | null | undefined;
  readonly title: string | null | undefined;
  readonly uiSchema: any | null | undefined;
  readonly " $fragmentType": "workflowTemplateFragment";
};
export type workflowTemplateFragment$key = {
  readonly " $data"?: workflowTemplateFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"workflowTemplateFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "workflowTemplateFragment",
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
  "type": "WorkflowTemplate",
  "abstractKey": null
};

(node as any).hash = "959850317e316a423e70b0c89c011f27";

export default node;
