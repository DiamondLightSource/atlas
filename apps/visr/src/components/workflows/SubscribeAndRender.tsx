import React, { useMemo, useState } from "react";
import { useSubscription } from "react-relay";
import type { GraphQLSubscriptionConfig } from "relay-runtime";
import type { Visit } from "@diamondlightsource/sci-react-ui";
import { graphql, type GraphQLTaggedNode } from "react-relay";
import type {
  SubmissionGraphQLErrorMessage,
  SubmissionNetworkErrorMessage,
  SubmissionSuccessMessage,
} from "../../utils/types";
import { RenderSubmittedMessage } from "./RenderSubmittedMessage";
import type {
  SubscribeAndRenderSubscription$data,
  SubscribeAndRenderSubscription as SubscribeAndRenderSubscriptionType,
} from "./__generated__/SubscribeAndRenderSubscription.graphql";

export const SubscribeAndRenderSubscription: GraphQLTaggedNode = graphql`
  subscription SubscribeAndRenderSubscription(
    $visit: VisitInput!
    $name: String!
  ) {
    workflow(visit: $visit, name: $name) {
      ...RenderSubmittedMessageFragment
    }
  }
`;

interface SubscribeAndRenderPropsList {
  result:
    | SubmissionGraphQLErrorMessage
    | SubmissionNetworkErrorMessage
    | SubmissionSuccessMessage;
  visit: Visit;
  workflowName: string;
  index: number;
}

export const SubscribeAndRender: React.FC<SubscribeAndRenderPropsList> = ({
  result,
  visit,
  workflowName,
  index,
}) => {
  const [workflowData, setWorkflowData] =
    useState<SubscribeAndRenderSubscription$data | null>(null);
  console.log("Using subscribe and render. workflowData", workflowData);

  const subscriptionData: GraphQLSubscriptionConfig<SubscribeAndRenderSubscriptionType> =
    useMemo(
      () => ({
        subscription: SubscribeAndRenderSubscription,
        variables: { visit, name: workflowName },
        onNext: response => {
          setWorkflowData(response ?? null);
        },
        onError: (error: unknown) => {
          console.error("Subscription error:", error);
        },
        onCompleted: () => {
          console.log("completed");
        },
      }),
      [visit, workflowName],
    );

  useSubscription(subscriptionData);

  console.log("Using subscription data", subscriptionData);

  return (
    <RenderSubmittedMessage
      result={result}
      index={index}
      fragmentRef={workflowData?.workflow ?? null}
    />
  );
};
