import { Suspense } from "react";
import { render, act } from "@atlas/vitest-conf";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import type { OperationDescriptor } from "relay-runtime";
import { type Mock } from "vitest";

import TemplateView from "./TemplateView";
import SubmissionForm from "./SubmissionForm";
import SubmittedMessagesList from "./SubmittedMessagesList";

vi.mock("./SubmissionForm", () => ({
  default: vi.fn(() => null),
}));
vi.mock("./SubmittedMessagesList", () => ({
  default: vi.fn(() => null),
}));

const mockedSubmissionForm = SubmissionForm as unknown as Mock;
const mockedSubmittedMessagesList = SubmittedMessagesList as unknown as Mock;

const testVisit = { proposalCode: "cm", proposalNumber: 12345, number: 1 };

const templateName = "ptypy-p99-from-config";

function renderTemplateView(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  return act(() =>
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={<div data-testid="loading" />}>
          <TemplateView templateName={templateName} visit={testVisit} />
        </Suspense>
      </RelayEnvironmentProvider>,
    ),
  );
}

// Resolves whatever the most recently-issued query operation is
// with a WorkflowTemplate payload.
async function resolveTemplateQuery(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(
      (operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          WorkflowTemplate: () => ({
            title: "PtyPy Reconstruction for P99",
            name: templateName,
            maintainer: "imaging-ptypy-group",
            description: "Runs a PtyPy reconstruction job.",
            repository:
              "https://github.com/DiamondLightSource/imaging-workflows",
            arguments: { properties: {}, required: [], type: "object" },
            uiSchema: null,
          }),
        }),
    );
  });
}

function resolveMutationSuccess(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  act(() => {
    environment.mock.resolveMostRecentOperation(
      (operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          Workflow: () => ({
            name: templateName,
          }),
        }),
    );
  });
}

function resolveMutationWithGraphQLError(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  act(() => {
    const operation = environment.mock.getMostRecentOperation();
    // The mutation's data+errors need to travel together, so resolve
    // with a raw payload rather than MockPayloadGenerator here.
    environment.mock.resolve(operation, {
      data: { submitWorkflowTemplate: { name: templateName } },
      errors: [{ message: "GraphQL Error" }],
    });
  });
}

function rejectMutationWithNetworkError(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  act(() => {
    environment.mock.rejectMostRecentOperation(new Error("network error"));
  });
}

// Grabs the props TemplateView most recently passed to SubmissionForm.
function latestSubmissionFormProps() {
  const calls = mockedSubmissionForm.mock.calls;
  return calls[calls.length - 1][0];
}

function latestSubmittedMessagesListProps() {
  const calls = mockedSubmittedMessagesList.mock.calls;
  return calls[calls.length - 1][0];
}

describe("TemplateView", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
    localStorage.clear();
    mockedSubmissionForm.mockClear();
    mockedSubmittedMessagesList.mockClear();
  });

  it("passes the fetched template and the given visit to SubmissionForm", async () => {
    renderTemplateView(environment);
    await resolveTemplateQuery(environment);

    const props = latestSubmissionFormProps();
    expect(props.visit).toEqual(testVisit);
    expect(props.template).toBeDefined();
  });

  it("falls back to the visit stored in localStorage when none is passed in", async () => {
    localStorage.setItem("instrumentSessionID", "cm12345-1");

    act(() =>
      render(
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={<div data-testid="loading" />}>
            <TemplateView templateName={templateName} />
          </Suspense>
        </RelayEnvironmentProvider>,
      ),
    );
    await resolveTemplateQuery(environment);

    expect(latestSubmissionFormProps().visit).toEqual(testVisit);
  });

  it("records a success entry and persists the visit when the mutation succeeds", async () => {
    renderTemplateView(environment);
    await resolveTemplateQuery(environment);

    const { onSubmit } = latestSubmissionFormProps();
    act(() => onSubmit(testVisit, {}));
    resolveMutationSuccess(environment);

    const { submissionData } = latestSubmittedMessagesListProps();
    expect(submissionData).toHaveLength(1);
    expect(submissionData[0].submissionResult.type).toBe("success");
    expect(localStorage.getItem("instrumentSessionID")).toBe("cm12345-1");
  });

  it("records a graphQLError entry when the mutation resolves with errors", async () => {
    renderTemplateView(environment);
    await resolveTemplateQuery(environment);

    const { onSubmit } = latestSubmissionFormProps();
    act(() => onSubmit(testVisit, {}));
    resolveMutationWithGraphQLError(environment);

    const { submissionData } = latestSubmittedMessagesListProps();
    expect(submissionData[0].submissionResult.type).toBe("graphQLError");
  });

  it("records a networkError entry when the mutation request fails outright", async () => {
    renderTemplateView(environment);
    await resolveTemplateQuery(environment);

    const { onSubmit } = latestSubmissionFormProps();
    act(() => onSubmit(testVisit, {}));
    rejectMutationWithNetworkError(environment);

    const { submissionData } = latestSubmittedMessagesListProps();
    expect(submissionData[0].submissionResult.type).toBe("networkError");
  });

  it("prepends each new submission so the most recent appears first", async () => {
    renderTemplateView(environment);
    await resolveTemplateQuery(environment);

    const { onSubmit } = latestSubmissionFormProps();

    for (let i = 0; i < 5; i++) {
      act(() => onSubmit(testVisit, { run: i }));
      resolveMutationSuccess(environment);
    }

    const { submissionData } = latestSubmittedMessagesListProps();
    expect(submissionData).toHaveLength(5);
  });
});
