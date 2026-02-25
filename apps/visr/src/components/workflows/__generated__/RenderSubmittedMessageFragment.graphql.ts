/**
 * @generated SignedSource<<bd7ff7ba1bcdc5c52e1c430242977472>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RenderSubmittedMessageFragment$data = {
  readonly status: {
    readonly __typename: string;
  } | null | undefined;
  readonly " $fragmentType": "RenderSubmittedMessageFragment";
};
export type RenderSubmittedMessageFragment$key = {
  readonly " $data"?: RenderSubmittedMessageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RenderSubmittedMessageFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RenderSubmittedMessageFragment",
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
    }
  ],
  "type": "Workflow",
  "abstractKey": null
};

(node as any).hash = "34e394a057f277c9025232f9359c9d5c";

export default node;
