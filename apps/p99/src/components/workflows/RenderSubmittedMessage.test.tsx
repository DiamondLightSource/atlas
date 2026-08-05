import { render, screen, userEvent } from "@atlas/vitest-conf";
import RenderSubmittedMessage, {
  type RenderSubmittedMessageProps,
} from "./RenderSubmittedMessage";
import { RelayEnvironmentProvider, useFragment } from "react-relay";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import type { renderSubmittedMessageFragment$data } from "../../graphql/__generated__/renderSubmittedMessageFragment.graphql";
import type { PayloadError } from "relay-runtime";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-relay", async () => {
  const actual = await vi.importActual("react-relay");
  return {
    ...actual,
    RelayEnvironmentProvider: actual.RelayEnvironmentProvider,
    useFragment: vi.fn(),
  };
});

describe("RenderSubmittedMessage", () => {
  const user = userEvent.setup();

  const renderComponent = async (props: RenderSubmittedMessageProps) => {
    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <RenderSubmittedMessage {...props} />
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    );
  };

  it("renders a success", async () => {
    const mockSuccess: renderSubmittedMessageFragment$data = {
      status: { __typename: "WorkflowSucceededStatus" },
      " $fragmentType": "renderSubmittedMessageFragment",
    };

    vi.mocked(
      useFragment as () => renderSubmittedMessageFragment$data,
    ).mockReturnValueOnce(mockSuccess);

    const successProps: RenderSubmittedMessageProps = {
      result: {
        type: "success",
        message: "ab12345-1/mock-workflow",
      },
      index: 0,
    };

    await renderComponent(successProps);

    const link = screen.getByText("ab12345-1/mock-workflow");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://workflows.diamond.ac.uk/workflows/ab12345-1/mock-workflow",
    );
    expect(screen.getByTestId("status-icon-succeeded")).toBeInTheDocument();

    vi.clearAllMocks();
  });

  it("renders a networkError", async () => {
    const mockError = {
      name: "Mock Network Error",
      message: "Error message",
    };

    const errorProps: RenderSubmittedMessageProps = {
      result: { type: "networkError", error: mockError },
      index: 0,
    };

    await renderComponent(errorProps);

    const accordionInfo = screen.getByText(/Submission error type/);
    const accordionDetails = screen.getByText(/Submission error message/);

    expect(accordionInfo).toHaveTextContent(mockError.name);
    expect(accordionDetails).not.toBeVisible();

    await user.click(accordionInfo);

    expect(accordionDetails).toBeVisible();
    expect(accordionDetails).toHaveTextContent(mockError.message);
  });

  it("renders a graphqlError", async () => {
    const mockError: PayloadError = {
      message: "GraphQL error",
    };
    const graphqlErrorProps: RenderSubmittedMessageProps = {
      result: { type: "graphQLError", errors: [mockError] },
      index: 0,
    };

    await renderComponent(graphqlErrorProps);

    const accordionInfo = screen.getByText("Submission error type GraphQL");
    const accordionDetails = screen.getByText(/Error 0/);

    expect(accordionInfo).toBeInTheDocument();
    expect(accordionDetails).not.toBeVisible();
    expect(accordionDetails).toHaveTextContent(mockError.message);

    await user.click(accordionInfo);

    expect(accordionDetails).toBeVisible();
  });
});
