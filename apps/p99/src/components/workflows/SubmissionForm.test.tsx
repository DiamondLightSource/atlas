import { render, screen } from "@atlas/vitest-conf";
import SubmissionForm from "./SubmissionForm";
import { RelayEnvironmentProvider, useFragment } from "react-relay";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import type { Visit } from "@diamondlightsource/sci-react-ui";
import { MemoryRouter } from "react-router-dom";
import type { workflowTemplateFragment$data } from "../../graphql/__generated__/workflowTemplateFragment.graphql";
import templateResponse from "../../mocks/template-response.json";

vi.mock("react-relay", async () => {
  const actual = await vi.importActual("react-relay");
  return {
    ...actual,
    RelayEnvironmentProvider: actual.RelayEnvironmentProvider,
    useFragment: vi.fn(),
  };
});

describe("SubmissionForm", () => {
  it("renders the correct template information", async () => {
    vi.mocked(
      useFragment as () => workflowTemplateFragment$data,
    ).mockReturnValue({
      ...templateResponse.data.workflowTemplate,
      " $fragmentType": "workflowTemplateFragment",
    });

    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <SubmissionForm
            template={{
              " $data": {
                ...templateResponse.data.workflowTemplate,
                " $fragmentType": "workflowTemplateFragment",
              },
              " $fragmentSpreads": { workflowTemplateFragment: true },
            }}
            onSubmit={vi.fn()}
            visit={
              { proposalCode: "ab", proposalNumber: 12345, number: 1 } as Visit
            }
          />
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Maintainer: imaging-ptypy-group"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Runs a PtyPy reconstruction job inside a container based on data collected at P99.",
      ),
    ).toBeInTheDocument();
    const link = await screen.findByText(
      "https://github.com/DiamondLightSource/imaging-workflows",
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/DiamondLightSource/imaging-workflows",
    );
  });
});
