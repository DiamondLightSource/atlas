import { render, act } from "@atlas/vitest-conf";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { type Mock } from "vitest";

import SubscribeAndRender from "./SubscribeAndRender";
import RenderSubmittedMessage from "./RenderSubmittedMessage";

vi.mock("./RenderSubmittedMessage", () => ({
  default: vi.fn(() => null),
}));

const mockedRenderSubmittedMessage = RenderSubmittedMessage as unknown as Mock;

const testVisit = { proposalCode: "ab", proposalNumber: 12345, number: 1 };
const workflowName = "ptypy-p99-from-config";
const testResult = { type: "success" as const, message: "test" };

function renderSubscribeAndRender(
  environment: ReturnType<typeof createMockEnvironment>,
) {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <SubscribeAndRender
        result={testResult}
        visit={testVisit}
        workflowName={workflowName}
        index={0}
      />
    </RelayEnvironmentProvider>,
  );
}

function latestRenderSubmittedMessageProps() {
  const calls = mockedRenderSubmittedMessage.mock.calls;
  return calls[calls.length - 1][0];
}

describe("SubscribeAndRender", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
    mockedRenderSubmittedMessage.mockClear();
  });

  it("subscribes with the given visit and workflow name", () => {
    renderSubscribeAndRender(environment);

    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.variables).toEqual({
      visit: testVisit,
      name: workflowName,
    });
  });

  it("passes result and index straight through, with a null fragmentRef before any push", () => {
    renderSubscribeAndRender(environment);

    const props = latestRenderSubmittedMessageProps();
    expect(props.result).toEqual(testResult);
    expect(props.index).toBe(0);
    expect(props.fragmentRef).toBeNull();
  });

  it("passes the workflow payload as fragmentRef once the subscription pushes a value", () => {
    renderSubscribeAndRender(environment);
    const operation = environment.mock.getMostRecentOperation();

    act(() => {
      environment.mock.nextValue(
        operation,
        MockPayloadGenerator.generate(operation, {
          Workflow: () => ({ name: workflowName }),
        }),
      );
    });

    expect(latestRenderSubmittedMessageProps().fragmentRef).not.toBeNull();
  });

  it("updates fragmentRef again on a second push without completing the subscription", () => {
    renderSubscribeAndRender(environment);
    const operation = environment.mock.getMostRecentOperation();

    act(() => {
      environment.mock.nextValue(
        operation,
        MockPayloadGenerator.generate(operation, {
          WorkflowSubscriptionPayload: () => ({
            workflow: { __typename: "Workflow" },
          }),
        }),
      );
    });
    const firstFragmentRef = latestRenderSubmittedMessageProps().fragmentRef;

    act(() => {
      environment.mock.nextValue(
        operation,
        MockPayloadGenerator.generate(operation, {
          WorkflowSubscriptionPayload: () => ({
            workflow: { __typename: "Workflow" },
          }),
        }),
      );
    });
    const secondFragmentRef = latestRenderSubmittedMessageProps().fragmentRef;

    expect(secondFragmentRef).not.toBeNull();
    expect(secondFragmentRef).not.toBe(firstFragmentRef);
  });

  it("logs subscription errors without throwing", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    renderSubscribeAndRender(environment);

    act(() => {
      environment.mock.rejectMostRecentOperation(
        new Error("subscription failed"),
      );
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Subscription error:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
