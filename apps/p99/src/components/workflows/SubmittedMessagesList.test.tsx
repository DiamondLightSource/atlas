import { render, screen } from "@testing-library/react";
import type { SubmissionData } from "../../utils/types";
import { MemoryRouter } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "../../context/supergraph/RelayEnvironment";
import SubmittedMessagesList from "./SubmittedMessagesList";
import { userEvent } from "@atlas/vitest-conf";

describe("SubmittedMessagesList", () => {
  const user = userEvent.setup();

  it("renders the correct submitted messages", async () => {
    const messages: SubmissionData[] = [
      {
        submissionResult: {
          type: "success",
          message: "ab12345-1/mock-workflow",
        },
        visit: {
          proposalCode: "ab",
          proposalNumber: 12345,
          number: 1,
        },
      },
      {
        submissionResult: {
          type: "networkError",
          error: { name: "NetworkError", message: "Mock Error" },
        },
        visit: {
          proposalCode: "ab",
          proposalNumber: 12345,
          number: 1,
        },
      },
      {
        submissionResult: {
          type: "graphQLError",
          errors: [{ message: "Mock graphql error" }],
        },
        visit: {
          proposalCode: "ab",
          proposalNumber: 12345,
          number: 1,
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <SubmittedMessagesList submissionData={messages} />
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    );

    const link = screen.getByText("ab12345-1/mock-workflow");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://workflows.diamond.ac.uk/workflows/ab12345-1/mock-workflow",
    );
    expect(screen.getByTestId("status-icon-unknown")).toBeInTheDocument();

    const networkAccordionInfo = screen.getByText(
      "Submission error type NetworkError",
    );
    const networkAccordionDetails = screen.getByText(
      /Submission error message/,
    );
    expect(networkAccordionDetails).not.toBeVisible();
    await user.click(networkAccordionInfo);
    expect(networkAccordionDetails).toBeVisible();
    expect(networkAccordionDetails).toHaveTextContent("Mock Error");

    const graphqlAccordionInfo = screen.getByText(
      "Submission error type GraphQL",
    );
    const graphqlAccordionDetails = screen.getByText(/Error 0/);
    expect(graphqlAccordionDetails).not.toBeVisible();
    await user.click(graphqlAccordionInfo);
    expect(graphqlAccordionDetails).toBeVisible();
    expect(graphqlAccordionDetails).toHaveTextContent("Mock graphql error");
  });
});
