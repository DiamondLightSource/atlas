/**
 * @generated SignedSource<<0cf6d3cdfc626be601743508e4756422>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type renderSubmittedMessageFragment$data = {
  readonly id: string;
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
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "id",
      storageKey: null,
    },
  ],
  type: "Workflow",
  abstractKey: null,
};

(node as any).hash = "fe393773e47da80475d877ac163f481d";

export default node;
