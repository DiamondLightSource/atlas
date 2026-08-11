import { render, screen } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { MemoryRouter } from "react-router-dom";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import SubscribeAndRender from "./SubscribeAndRender";

describe("SubscribeAndRender", () => {
  it("renders", async () => {
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

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-unknown")).toBeInTheDocument();
  });
});
