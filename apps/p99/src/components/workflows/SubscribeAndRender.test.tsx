import { render, screen } from "@testing-library/react";
import { RelayEnvironmentProvider, useFragment, useSubscription } from "react-relay";
import { MemoryRouter } from "react-router-dom";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import SubscribeAndRender from "./SubscribeAndRender";
import type { renderSubmittedMessageFragment$data } from "../../graphql/__generated__/renderSubmittedMessageFragment.graphql";

vi.mock("react-relay", async () => {
  const actual = await vi.importActual("react-relay");
  return {
    ...actual,
    RelayEnvironmentProvider: actual.RelayEnvironmentProvider,
    useSubscription: vi.fn(),
    useFragment: vi.fn()
  }
})

describe("SubscribeAndRender", () => {
  it("renders", async () => {
    vi.mocked(
      useFragment as () => renderSubmittedMessageFragment$data
    ).mockReturnValue({
      status: { __typename: "WorkflowSucceededStatus" },
      " $fragmentType": "renderSubmittedMessageFragment",
    })

    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <SubscribeAndRender
            result={{ type: "success", message: "test" }}
            visit={{ proposalCode: "ab", proposalNumber: 12345, number: 1 }}
            workflowName="ptypy-p99-from-config"
            index={0}
          />
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    );

    expect(useSubscription).toHaveBeenCalled();
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-succeeded")).toBeInTheDocument();
  });
});
