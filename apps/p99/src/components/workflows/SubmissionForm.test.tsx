import { render, screen } from "@atlas/vitest-conf";
import SubmissionForm from "./SubmissionForm";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import type { Visit } from "@diamondlightsource/sci-react-ui";
import type { templateViewQuery as TemplateViewQueryType } from "../../graphql/__generated__/templateViewQuery.graphql";
import { templateViewQuery } from "../../graphql/templateViewQuery";
import { server } from "../../mocks/server";
import { MemoryRouter } from "react-router-dom";

describe("SubmissionForm", () => {
  const SubmissionFormWithQuery = () => {
    const templateData = useLazyLoadQuery<TemplateViewQueryType>(
      templateViewQuery,
      { templateName: "ptypy-p99-from-config" },
    );
    return (
      <SubmissionForm
        template={templateData.workflowTemplate}
        onSubmit={vi.fn()}
        visit={
          { proposalCode: "ab", proposalNumber: 12345, number: 1 } as Visit
        }
      />
    );
  };

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it("renders the correct template information", async () => {
    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <SubmissionFormWithQuery />
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
