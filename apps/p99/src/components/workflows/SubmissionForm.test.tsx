import { Suspense } from "react";
import { render, screen, act } from "@atlas/vitest-conf";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import type { OperationDescriptor } from "relay-runtime";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import SubmissionForm from "./SubmissionForm";
import { SubmissionFormTestQuery } from "./SubmissionForm.testQuery";
import type { SubmissionFormTestQuery$data } from "./__generated__/SubmissionFormTestQuery.graphql";

vi.mock("@jsonforms/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@jsonforms/react")>();

  return {
    ...actual,
    JsonForms: vi.fn(() => null),
  };
});

vi.mock("@diamondlightsource/sci-react-ui", async () => {
  const actual = await vi.importActual("@diamondlightsource/sci-react-ui");
  return {
    ...actual,
    VisitInput: vi.fn(() => null),
  };
});

import { JsonForms } from "@jsonforms/react";
import { VisitInput } from "@diamondlightsource/sci-react-ui";
import { MemoryRouter } from "react-router-dom";

const mockedJsonForms = JsonForms as unknown as Mock;
const mockedVisitInput = VisitInput as unknown as Mock;

const testVisit = { proposalCode: "cm", proposalNumber: 12345, number: 1 };

// The harness fires the test query so useFragment inside SubmissionForm
// has a real fragment key to resolve, rather than a hand-built object.
function TestHarness({
  onSubmit,
  visit,
}: {
  onSubmit: (visit: typeof testVisit, parameters: object) => void;
  visit?: typeof testVisit;
}) {
  const data = useLazyLoadQuery(
    SubmissionFormTestQuery,
    {},
  ) as SubmissionFormTestQuery$data;
  return (
    <SubmissionForm
      template={data.workflowTemplate}
      onSubmit={onSubmit}
      visit={visit}
    />
  );
}

function renderSubmissionForm(
  environment: ReturnType<typeof createMockEnvironment>,
  onSubmit: (visit: typeof testVisit, parameters: object) => void,
) {
  return act(async () =>
    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={<div data-testid="loading" />}>
            <TestHarness onSubmit={onSubmit} visit={testVisit} />
          </Suspense>
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    ),
  );
}

async function resolveTemplateQuery(
  environment: ReturnType<typeof createMockEnvironment>,
  overrides: Partial<{
    title: string;
    description: string | null;
    maintainer: string;
    repository: string | null;
    uiSchema: unknown;
    arguments: unknown;
  }> = {},
) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(
      (operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          WorkflowTemplate: () => ({
            name: "ptypy-p99-from-config",
            maintainer: "imaging-ptypy-group",
            title: "PtyPy Reconstruction for P99",
            description: "Runs a PtyPy reconstruction job.",
            arguments: { properties: {}, required: [], type: "object" },
            uiSchema: null,
            repository:
              "https://github.com/DiamondLightSource/imaging-workflows",
            ...overrides,
          }),
        }),
    );
  });
}

function latestVisitInputProps() {
  const calls = mockedVisitInput.mock.calls;
  return calls[calls.length - 1][0];
}

function latestJsonFormsProps() {
  const calls = mockedJsonForms.mock.calls;
  return calls[calls.length - 1][0];
}

describe("SubmissionForm", () => {
  let environment: ReturnType<typeof createMockEnvironment>;
  let onSubmit: Mock;

  beforeEach(() => {
    environment = createMockEnvironment();
    onSubmit = vi.fn();
    mockedJsonForms.mockClear();
    mockedVisitInput.mockClear();
  });

  it("renders the fetched template's title, description and maintainer", async () => {
    await renderSubmissionForm(environment, onSubmit);
    await resolveTemplateQuery(environment);

    expect(
      screen.getByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Runs a PtyPy reconstruction job."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Maintainer: imaging-ptypy-group"),
    ).toBeInTheDocument();
  });

  it("renders a repository link only when one is present", async () => {
    await renderSubmissionForm(environment, onSubmit);
    await resolveTemplateQuery(environment, { repository: null });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("calls onSubmit when the visit form is submitted with no validation errors", async () => {
    await renderSubmissionForm(environment, onSubmit);
    await resolveTemplateQuery(environment);

    // Simulate JsonForms reporting a clean parameter set...
    act(() => {
      latestJsonFormsProps().onChange({ data: { id: 42 }, errors: [] });
    });
    // ...then simulate VisitInput's submit button being pressed.
    act(() => {
      latestVisitInputProps().onSubmit(testVisit, { id: 42 });
    });

    expect(onSubmit).toHaveBeenCalledWith(testVisit, { id: 42 });
  });

  it("does not call onSubmit while there are outstanding validation errors", async () => {
    await renderSubmissionForm(environment, onSubmit);
    await resolveTemplateQuery(environment);

    act(() => {
      latestJsonFormsProps().onChange({
        data: {},
        errors: [{ message: "id is required" }],
      });
    });
    act(() => {
      latestVisitInputProps().onSubmit(testVisit, {});
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the submitted snackbar after a successful submit", async () => {
    await renderSubmissionForm(environment, onSubmit);
    await resolveTemplateQuery(environment);

    act(() => {
      latestJsonFormsProps().onChange({ data: {}, errors: [] });
    });
    act(() => {
      latestVisitInputProps().onSubmit(testVisit, {});
    });

    expect(screen.getByText("Workflow submitted!")).toBeInTheDocument();
  });
});
