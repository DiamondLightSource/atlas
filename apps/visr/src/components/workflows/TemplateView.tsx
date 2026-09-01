import { useState } from "react";
import { useLazyLoadQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type {
  JSONObject,
  SubmissionGraphQLErrorMessage,
  SubmissionNetworkErrorMessage,
  SubmissionSuccessMessage,
} from "../../utils/types";
import { type Visit, visitToText } from "@diamondlightsource/sci-react-ui";
import SubmissionForm from "./SubmissionForm";
import type { TemplateViewQuery as TemplateViewQueryType } from "./__generated__/TemplateViewQuery.graphql";
import { visitTextToVisit } from "../../utils/common";
import { Box } from "@mui/material";
import SubmittedMessagesList from "./SubmittedMessagesList";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { useInstrumentSession } from "@atlas/app-shell";

const templateViewQuery = graphql`
  query TemplateViewQuery($templateName: String!) {
    workflowTemplate(name: $templateName) {
      ...workflowTemplateFragment
    }
  }
`;

export default function TemplateView({
  templateName,
  visit,
  prepopulatedParameters,
}: {
  templateName: string;
  visit?: Visit;
  prepopulatedParameters?: JSONObject;
}) {
  const data = useLazyLoadQuery<TemplateViewQueryType>(templateViewQuery, {
    templateName,
  });
  const [submissionResults, setSubmissionResults] = useState<
    (
      | SubmissionSuccessMessage
      | SubmissionNetworkErrorMessage
      | SubmissionGraphQLErrorMessage
    )[]
  >([]);

  const { instrumentSession } = useInstrumentSession();
  const storedVisit = visitTextToVisit(instrumentSession);

  const submit = useSubmitWorkflow(templateName);

  async function submitWorkflow(visit: Visit, parameters: object) {
    try {
      const { name: submittedName } = await submit(visit, parameters);
      setSubmissionResults(prev => [
        {
          type: "success",
          message: `${visitToText(visit)}/${submittedName}`,
        },
        ...prev,
      ]);
      localStorage.setItem("instrumentSessionID", visitToText(visit));
    } catch (err) {
      // Err is either GraphQL errors array or a single network error
      if (Array.isArray(err)) {
        setSubmissionResults(prev => [
          {
            type: "graphQLError",
            errors: err,
          },
          ...prev,
        ]);
      } else {
        setSubmissionResults(prev => [
          {
            type: "networkError",
            error: err as Error,
          },
          ...prev,
        ]);
      }
    }
  }

  return (
    <Box>
      <SubmissionForm
        template={data.workflowTemplate}
        prepopulatedParameters={prepopulatedParameters}
        visit={visit ?? storedVisit ?? undefined}
        onSubmit={submitWorkflow}
      />
      <SubmittedMessagesList submissionResults={submissionResults} />
    </Box>
  );
}
