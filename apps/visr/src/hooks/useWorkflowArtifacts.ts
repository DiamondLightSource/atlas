import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { requestSubscription } from "relay-runtime";

import type { VisitInput } from "../graphql/__generated__/workflowsQuery.graphql";
import { workflowSubscription } from "../graphql/workflowRelaySubscription";
import type { workflowRelaySubscription } from "../graphql/__generated__/workflowRelaySubscription.graphql";

export interface WorkflowArtifact {
  name: string;
  url: string;
  mimeType: string;
}

export function useWorkflowArtifacts(
  visit: VisitInput | null,
  name: string | null,
): WorkflowArtifact[] {
  const environment = useRelayEnvironment();
  const [artifacts, setArtifacts] = useState<WorkflowArtifact[]>([]);
  const { number: visitNumber, proposalNumber, proposalCode } = visit ?? {};

  useEffect(() => {
    if (
      visitNumber == null ||
      proposalCode == null ||
      proposalNumber == null ||
      !name
    ) {
      return;
    }
    const variables = {
      visit: { number: visitNumber, proposalNumber, proposalCode },
      name: name,
    };
    const disposable = requestSubscription<workflowRelaySubscription>(
      environment,
      {
        subscription: workflowSubscription,
        variables,
        onNext: response => {
          const status = response?.workflow?.status;

          let nextArtifacts = null;

          if (
            status?.__typename === "WorkflowRunningStatus" ||
            status?.__typename === "WorkflowSucceededStatus" ||
            status?.__typename === "WorkflowFailedStatus" ||
            status?.__typename === "WorkflowErroredStatus"
          ) {
            nextArtifacts = (status?.tasks ?? []).flatMap(
              task => task?.artifacts ?? [],
            );
          }

          setArtifacts(nextArtifacts ?? []);
        },
        onError: error => {
          console.error("Workflow Subscription error:", error);
        },
      },
    );

    return () => {
      disposable.dispose();
    };
  }, [environment, visitNumber, proposalCode, proposalNumber, name]);

  return artifacts;
}
