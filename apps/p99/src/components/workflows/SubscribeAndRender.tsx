import type { Visit } from "@diamondlightsource/sci-react-ui";
import type {
  SubmissionGraphQLErrorMessage,
  SubmissionNetworkErrorMessage,
  SubmissionSuccessMessage,
} from "../../utils/types";
import RenderSubmittedMessage from "./RenderSubmittedMessage";
import { useMemo, useState } from "react";
import type {
  subscribeAndRenderSubscription$data,
  subscribeAndRenderSubscription as SubscribeAndRenderSubscriptionType,
} from "../../graphql/__generated__/subscribeAndRenderSubscription.graphql";
import { subscribeAndRenderSubscription } from "../../graphql/subscribeAndRenderSubscription";
import { useSubscription } from "react-relay";
import type { GraphQLSubscriptionConfig } from "relay-runtime";

const SubscribeAndRender = ({
  result,
  visit,
  workflowName,
  index,
}: {
  result:
    | SubmissionGraphQLErrorMessage
    | SubmissionNetworkErrorMessage
    | SubmissionSuccessMessage;
  visit: Visit;
  workflowName: string;
  index: number;
}) => {
  const [workflowData, setWorkflowData] =
    useState<subscribeAndRenderSubscription$data | null>(null);

  const subscriptionData: GraphQLSubscriptionConfig<SubscribeAndRenderSubscriptionType> =
    useMemo(
      () => ({
        subscription: subscribeAndRenderSubscription,
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

  return (
    <RenderSubmittedMessage
      result={result}
      index={index}
      fragmentRef={workflowData?.workflow ?? null}
    />
  );
};

export default SubscribeAndRender;
