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
  } from "../../graphql/__generated__/subscribeAndRenderSubscription.graphql";
import { subscribeAndRenderSubscription } from "../../graphql/subscribeAndRenderSubscription";
import { useSubscription } from "react-relay";

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

  const subscriptionData = useMemo(
      () => ({
        subscription: subscribeAndRenderSubscription,
        variables: { visit, name: workflowName },
        onNext: (response: unknown) => {
          setWorkflowData(response as subscribeAndRenderSubscription$data);
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
