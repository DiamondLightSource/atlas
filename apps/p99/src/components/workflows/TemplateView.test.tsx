import { render, screen } from "@testing-library/react";
import { userEvent } from "@atlas/vitest-conf";
import { MemoryRouter } from "react-router-dom";
import {
  RelayEnvironmentProvider,
  useFragment,
  useLazyLoadQuery,
} from "react-relay";
import { RelayEnvironment } from "../../context/workflows/RelayEnvironment";
import TemplateView from "./TemplateView";
import type { templateViewQuery$data } from "../../graphql/__generated__/templateViewQuery.graphql";
import type { workflowTemplateFragment$data } from "../../graphql/__generated__/workflowTemplateFragment.graphql";
import templateResponse from "../../mocks/template-response.json";
import { server } from "../../mocks/server";

vi.mock("react-relay", async () => {
  const actual = await vi.importActual("react-relay");
  return {
    ...actual,
    RelayEnvironmentProvider: actual.RelayEnvironmentProvider,
    useFragment: vi.fn(),
    useLazyLoadQuery: vi.fn(),
    useMutation: actual.useMutation,
    useSubscription: vi.fn(),
  };
});

describe("TemplateView", () => {
  const user = userEvent.setup();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
     vi.mocked(useLazyLoadQuery as () => templateViewQuery$data).mockReturnValue(
      {
        workflowTemplate: {
          " $fragmentSpreads": { workflowTemplateFragment: true },
        },
      },
    );
    vi.mocked(
      useFragment as () => workflowTemplateFragment$data,
    ).mockReturnValue({
      ...templateResponse.data.workflowTemplate,
      " $fragmentType": "workflowTemplateFragment",
    });

    render(
      <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <TemplateView templateName="ptypy-p99-from-config" />
        </RelayEnvironmentProvider>
      </MemoryRouter>,
    );
  })

  afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("renders the submission form with the default values", async () => {
    expect(
      await screen.findByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Scan Number" })).toHaveValue(
      null,
    );
    expect(
      screen.getByRole("textbox", { name: "Path to raw data folder" }),
    ).toHaveValue("processing/writenData/reconstruction_test_data");
    expect(
      screen.getByRole("textbox", { name: "Requested CPU memory" }),
    ).toHaveValue("20Gi");
    expect(
      screen.getByRole("spinbutton", { name: "Nr. of processes" }),
    ).toHaveValue(1);
    expect(
      screen.getByRole("textbox", { name: "Path to output folder" }),
    ).toHaveValue("processing/workflows/ptypy");
    expect(screen.getByRole("checkbox", { name: "Use GPU" })).not.toBeChecked();
  });

  it("adds submitted workflows to list", async () => {
    expect(
      await screen.findByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Submissions")).not.toBeInTheDocument();

    const scanBox = screen.getByRole("spinbutton", { name: "Scan Number" });
    const visitBox = screen.getByRole("textbox", { name: "Visit" });
    const submitButton = screen.getByRole("button", { name: "Submit" });

    expect(scanBox).toHaveValue(null);
    await user.type(scanBox, "1");
    expect(scanBox).toHaveValue(1);
    await user.clear(visitBox);
    await user.type(visitBox, "ab12345-1");
    for (let i = 0; i < 5; i++) await user.click(submitButton);

    expect(await screen.findByText("Submissions")).toBeVisible();
    expect(screen.getAllByText("ab12345-1/ptypy-p99-from-config")).toHaveLength(
      5,
    );
  });

  it("renders submission response with network error", async () => {
    expect(
      await screen.findByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Submissions")).not.toBeInTheDocument();

    const scanBox = screen.getByRole("spinbutton", { name: "Scan Number" });
    const visitBox = screen.getByRole("textbox", { name: "Visit" });
    const submitButton = screen.getByRole("button", { name: "Submit" });

    expect(scanBox).toHaveValue(null);
    await user.type(scanBox, "1");
    expect(scanBox).toHaveValue(1);
    await user.clear(visitBox);
    await user.type(visitBox, "ne11111-1");
    await user.click(submitButton);

    expect(await screen.findByText("Submissions")).toBeVisible();
    expect(
      screen.queryByText("Submission error type TypeError"),
    ).toBeInTheDocument();
  });

  it("renders submission response with graphql error", async () => {
    expect(
      await screen.findByText("PtyPy Reconstruction for P99"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Submissions")).not.toBeInTheDocument();

    const scanBox = screen.getByRole("spinbutton", { name: "Scan Number" });
    const visitBox = screen.getByRole("textbox", { name: "Visit" });
    const submitButton = screen.getByRole("button", { name: "Submit" });

    expect(scanBox).toHaveValue(null);
    await user.type(scanBox, "1");
    expect(scanBox).toHaveValue(1);
    await user.clear(visitBox);
    await user.type(visitBox, "ge22222-1");
    await user.click(submitButton);

    expect(await screen.findByText("Submissions")).toBeVisible();
    expect(
      screen.queryByText("Submission error type GraphQL"),
    ).toBeInTheDocument();
    expect(screen.queryByText("GraphQL Error"));
  });
});
