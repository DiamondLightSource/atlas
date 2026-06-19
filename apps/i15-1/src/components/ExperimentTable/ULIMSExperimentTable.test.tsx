import { render, screen, fireEvent } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { ExperimentList } from "./ULIMSExperimentsTable";
import * as apollo from "@apollo/client/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    useQuery: vi.fn(),
  };
});

const mockedUseQuery = apollo.useQuery as unknown as Mock;

afterEach(() => {
  vi.restoreAllMocks();
});

const mockExperiments = {
  instrumentSession: {
    experiments: {
      edges: [
        {
          node: {
            name: "Exp 1",
            sample: {
              name: "Sample A",
              data: {
                density: 1.2,
                composition: "H2O",
              },
            },
            experimentDefinition: {
              name: "Def 1",
              data: {
                beam_energy: 20,
                time_per_pdf: 10,
                focused_beam_size: 5,
              },
            },
          },
        },
      ],
    },
  },
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ExperimentList />
    </MemoryRouter>,
  );

describe("ExperimentList", () => {
  it("renders experiment data in table", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getByText("Exp 1")).toBeInTheDocument();
    expect(screen.getByText("Sample A")).toBeInTheDocument();
    expect(screen.getByText("H2O")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // MRT uses progress UI, so check for generic loading indicator
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error banner when query fails", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error("Failed to fetch"),
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  it("shows 'Add all to queue' when nothing selected", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(
      screen.getByRole("button", { name: /add all to queue/i }),
    ).toBeInTheDocument();
  });

  it("changes button text when a row is selected", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Click row checkbox (MRT adds checkboxes automatically)
    const checkbox = screen.getAllByRole("checkbox")[1]; // first is "select all", second is row
    fireEvent.click(checkbox);

    expect(
      screen.getByRole("button", {
        name: /add selected 1 to queue/i,
      }),
    ).toBeInTheDocument();
  });
});
