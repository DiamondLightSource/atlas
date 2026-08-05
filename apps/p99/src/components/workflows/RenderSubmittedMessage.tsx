import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import type {
  SubmissionGraphQLErrorMessage,
  SubmissionNetworkErrorMessage,
  SubmissionSuccessMessage,
  WorkflowStatus,
} from "../../utils/types";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { renderSubmittedMessageFragment$key } from "../../graphql/__generated__/renderSubmittedMessageFragment.graphql";
import { useFragment } from "react-relay";
import { renderSubmittedMessageFragment } from "../../graphql/renderSubmittedMessageFragment";
import { getWorkflowStatusIcon } from "./StatusIcons";

export interface RenderSubmittedMessageProps {
  result:
    | SubmissionGraphQLErrorMessage
    | SubmissionNetworkErrorMessage
    | SubmissionSuccessMessage;
  index: number;
  fragmentRef?: renderSubmittedMessageFragment$key | null;
}

const RenderSubmittedMessage = ({
  result,
  index,
  fragmentRef,
}: RenderSubmittedMessageProps) => {
  const data = useFragment(renderSubmittedMessageFragment, fragmentRef);
  switch (result.type) {
    case "success":
      return (
        <Accordion
          key={`success-${String(index)}`}
          disableGutters
          onChange={() => {}}
        >
          <AccordionSummary>
            <Typography>
              Successfully submitted{" "}
              <Link
                to={`https://workflows.diamond.ac.uk/workflows/${result.message}`}
              >
                {result.message}
              </Link>
            </Typography>
            {data
              ? getWorkflowStatusIcon(data.status?.__typename as WorkflowStatus)
              : getWorkflowStatusIcon("Unknown")}
          </AccordionSummary>
        </Accordion>
      );
    case "networkError":
      return (
        <Accordion key={`errors-${String(index)}`}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography sx={{ color: "red" }}>
              Submission error type {result.error.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Submission error message {result.error.message}
            </Typography>
          </AccordionDetails>
        </Accordion>
      );
    case "graphQLError":
    default:
      return (
        <Accordion key={`errors-${String(index)}`}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography sx={{ color: "red" }}>
              Submission error type GraphQL
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {result.errors.map((e, j) => {
              return (
                <Typography key={`errors-msgs=${String(j)}`}>
                  Error {j} {e.message}
                </Typography>
              );
            })}
          </AccordionDetails>
        </Accordion>
      );
  }
};

export default RenderSubmittedMessage;
