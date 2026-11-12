/**
 * @generated SignedSource<<38bf7fc232db12c20f23bdfba063f4a4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type renderSubmittedMessageFragment$data = {
  readonly status:
    | {
        readonly __typename: string;
      }
    | null
    | undefined;
  readonly " $fragmentType": "renderSubmittedMessageFragment";
};
export type renderSubmittedMessageFragment$key = {
  readonly " $data"?: renderSubmittedMessageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"renderSubmittedMessageFragment">;
};

const node: ReaderFragment = {
  argumentDefinitions: [],
  kind: "Fragment",
  metadata: null,
  name: "renderSubmittedMessageFragment",
  selections: [
    {
      alias: null,
      args: null,
      concreteType: null,
      kind: "LinkedField",
      name: "status",
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "__typename",
          storageKey: null,
        },
      ],
      storageKey: null,
    },
  ],
  type: "Workflow",
  abstractKey: null,
};

(node as any).hash = "03e612be6ddc650f978d56b8e18a9818";

export default node;
