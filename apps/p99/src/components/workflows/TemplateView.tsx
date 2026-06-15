import { Box } from "@mui/material";
import { useLazyLoadQuery, useMutation } from "react-relay";
import type { templateViewQuery as TemplateViewQueryType } from "../../graphql/__generated__/templateViewQuery.graphql";
import { templateViewQuery } from "../../graphql/templateViewQuery";
import SubmissionForm from "./SubmissionForm";
import { visitToText, type Visit } from "@diamondlightsource/sci-react-ui";
import type { SubmissionData } from "../../utils/types";
import { useState } from "react";
import { visitTextToVisit } from "../../utils/common";
import SubmittedMessagesList from "./SubmittedMessagesList";
import { mutation } from "../../graphql/submitWorkflowTemplateMutation";
import type { submitWorkflowTemplateMutation } from "../../graphql/__generated__/submitWorkflowTemplateMutation.graphql";

const TemplateView = ({
  templateName,
  visit,
}: {
  templateName: string;
  visit?: Visit;
}) => {
  const templateData = useLazyLoadQuery<TemplateViewQueryType>(
    templateViewQuery,
    { templateName },
    { fetchPolicy: "store-and-network" },
  );

  const [submissionData, setSubmissionData] = useState<SubmissionData[]>([]);
  const [commitMutation] =
    useMutation<submitWorkflowTemplateMutation>(mutation);

  const storedVisit = visitTextToVisit(
    localStorage.getItem("instrumentSessionID") ?? "",
  );

  const submitWorkflow = (visit: Visit, parameters: object) => {
    commitMutation({
      variables: { templateName, visit, parameters },
      onCompleted: (response, errors) => {
        if (errors?.length) {
          setSubmissionData(prev => [
            { submissionResult: { type: "graphQLError", errors }, visit },
            ...prev,
          ]);
        } else {
          const submittedName = response.submitWorkflowTemplate.name;
          setSubmissionData(prev => [
            {
              submissionResult: {
                type: "success",
                message: `${visitToText(visit)}/${submittedName}`,
              },
              visit,
              workflowName: submittedName,
            },
            ...prev,
          ]);
          localStorage.setItem("instrumentSessionID", visitToText(visit));
        }
      },
      onError: err => {
        setSubmissionData(prev => [
          { submissionResult: { type: "networkError", error: err }, visit },
          ...prev,
        ]);
      },
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={3}
      mb={10}
    >
      <SubmissionForm
        template={templateData.workflowTemplate}
        onSubmit={submitWorkflow}
        visit={visit ?? storedVisit ?? undefined}
      />
      <SubmittedMessagesList submissionData={submissionData} />
    </Box>
  );
};

export default TemplateView;
