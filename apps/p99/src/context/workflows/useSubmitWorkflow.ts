import type { VisitInput } from "../../graphql/__generated__/submitWorkflowTemplateMutation.graphql";
import { submitWorkflowTemplate } from "../../graphql/submitWorkflowTemplate";
import { RelayEnvironment } from "./RelayEnvironment";

export const useSubmitWorkflow = (templateName: string) => {
  return (visit: VisitInput, parameters: object) => {
    return submitWorkflowTemplate(RelayEnvironment, {
      templateName,
      visit,
      parameters,
    });
  };
};
