import { submitWorkflowTemplate } from "../graphql/submitWorkflowTemplate";
import type { VisitInput } from "../graphql/__generated__/workflowsQuery.graphql";
import { useRelayEnvironment } from "react-relay";

/**
 * Returns a function (visit, parameters) => Promise<{name: string}>
 * that components can call to submit a workflow with the given templateName
 */
export function useSubmitWorkflow(templateName: string) {
  const environment = useRelayEnvironment();

  return (visit: VisitInput, parameters: object) => {
    return submitWorkflowTemplate(environment, {
      templateName,
      visit,
      parameters,
    });
  };
}
