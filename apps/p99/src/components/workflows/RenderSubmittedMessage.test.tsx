import { Suspense } from "react";
import { render, screen, userEvent, act } from "@atlas/vitest-conf";
import { MemoryRouter } from "react-router-dom";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment } from "relay-test-utils";
import type { PayloadError } from "relay-runtime";

import RenderSubmittedMessage, {
  type RenderSubmittedMessageProps,
} from "./RenderSubmittedMessage";
import { RenderSubmittedMessageTestQuery } from "./RenderSubmittedMessage.testQuery";
import { type RenderSubmittedMessageTestQuery$data } from "./__generated__/RenderSubmittedMessageTestQuery.graphql";

// Harness resolves the test query so RenderSubmittedMessage's own
// useFragment call has a real fragment key when a test wants one.
// Passing fragmentRef={null} (the "data not loaded yet" case, or the
// error branches which never touch fragment data) skips the query
// entirely — useFragment supports a null ref natively.
const testVisit = { proposalCode: "ab", proposalNumber: 12345, number: 1 };
const workflowName = "mock-workflow";

function TestHarness({
  result,
  index,
  useResolvedFragment,
}: {
  result: RenderSubmittedMessageProps["result"];
  index: number;
  useResolvedFragment: boolean;
}) {
  if (useResolvedFragment) {
    return <TestHarnessWithResolvedFragment result={result} index={index} />;
  }

  return <TestHarnessWithoutResolvedFragment result={result} index={index} />;
}

function TestHarnessWithResolvedFragment({
  result,
  index,
}: Pick<Parameters<typeof TestHarness>[0], "result" | "index">) {
  const data = useLazyLoadQuery(RenderSubmittedMessageTestQuery, {
    visit: testVisit,
    name: workflowName,
  }) as RenderSubmittedMessageTestQuery$data;

  return (
    <RenderSubmittedMessage
      result={result}
      index={index}
      fragmentRef={data.workflow}
    />
  );
}

function TestHarnessWithoutResolvedFragment({
  result,
  index,
}: Pick<Parameters<typeof TestHarness>[0], "result" | "index">) {
  return (
    <RenderSubmittedMessage result={result} index={index} fragmentRef={null} />
  );
}

function renderHarness(
  environment: ReturnType<typeof createMockEnvironment>,
  props: {
    result: RenderSubmittedMessageProps["result"];
    index: number;
    useResolvedFragment: boolean;
  },
) {
  return render(
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={<div data-testid="loading" />}>
          <TestHarness {...props} />
        </Suspense>
      </RelayEnvironmentProvider>
    </MemoryRouter>,
  );
}

async function resolveWorkflowStatus(
  environment: ReturnType<typeof createMockEnvironment>,
  statusTypename: string,
) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(() => ({
      data: {
        workflow: {
          id: "mock-workflow-id",
          status: { __typename: statusTypename },
        },
      },
    }));
  });
}

describe("RenderSubmittedMessage", () => {
  const user = userEvent.setup();
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders a success with the succeeded status icon once the fragment resolves", async () => {
    renderHarness(environment, {
      result: { type: "success", message: "ab12345-1/mock-workflow" },
      index: 0,
      useResolvedFragment: true,
    });
    await resolveWorkflowStatus(environment, "WorkflowSucceededStatus");

    const link = screen.getByText("ab12345-1/mock-workflow");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://workflows.diamond.ac.uk/workflows/ab12345-1/mock-workflow",
    );
    expect(screen.getByTestId("status-icon-succeeded")).toBeInTheDocument();
  });

  it("falls back to the unknown status icon when there is no fragment data yet", () => {
    renderHarness(environment, {
      result: { type: "success", message: "ab12345-1/mock-workflow" },
      index: 0,
      useResolvedFragment: false,
    });

    expect(screen.getByTestId("status-icon-unknown")).toBeInTheDocument();
  });

  it("renders a networkError and expands to show the error message on click", async () => {
    const mockError = { name: "Mock Network Error", message: "Error message" };

    renderHarness(environment, {
      result: { type: "networkError", error: mockError },
      index: 0,
      useResolvedFragment: false,
    });

    const accordionInfo = screen.getByText(/Submission error type/);
    const accordionDetails = screen.getByText(/Submission error message/);

    expect(accordionInfo).toHaveTextContent(mockError.name);
    expect(accordionDetails).not.toBeVisible();

    await user.click(accordionInfo);

    expect(accordionDetails).toBeVisible();
    expect(accordionDetails).toHaveTextContent(mockError.message);
  });

  it("renders a graphQLError and expands to show each error message on click", async () => {
    const mockError: PayloadError = { message: "GraphQL error" };

    renderHarness(environment, {
      result: { type: "graphQLError", errors: [mockError] },
      index: 0,
      useResolvedFragment: false,
    });

    const accordionInfo = screen.getByText("Submission error type GraphQL");
    const accordionDetails = screen.getByText(/Error 0/);

    expect(accordionInfo).toBeInTheDocument();
    expect(accordionDetails).not.toBeVisible();
    expect(accordionDetails).toHaveTextContent(mockError.message);

    await user.click(accordionInfo);

    expect(accordionDetails).toBeVisible();
  });
});
