import { render, screen, fireEvent, waitFor } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { ExperimentList } from "./ULIMSExperimentsTable";
import * as apollo from "@apollo/client/react";
import { MemoryRouter } from "react-router-dom";
import * as queueService from "../../queue/queueService";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as appShell from "@atlas/app-shell";

vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apollo/client/react")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock("../../queue/queueService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../queue/queueService")>();
  return {
    ...actual,
    useSumbitQueueTasks: vi.fn(),
  };
});

vi.mock("@atlas/app-shell", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@atlas/app-shell")>();
  return {
    ...actual,
    useInstrumentSession: vi.fn(),
  };
});

const mockedUseSubmitTask = queueService.useSumbitQueueTasks as unknown as Mock;
const mockedUseQuery = apollo.useQuery as unknown as Mock;
const mockedUseInstrumentSession =
  appShell.useInstrumentSession as unknown as Mock;

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  mockedUseSubmitTask.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
  mockedUseInstrumentSession.mockReturnValue({
    instrumentSession: "cm44163-3",
    setInstrumentSession: vi.fn(),
    sessionsList: ["cm44163-3"],
  });
});

const mockExperiments = {
  experiments: {
    edges: [
      {
        node: {
          name: "Exp 1",
          sample: {
            name: "Sample A",
            container: {
              parent: null,
            },
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
      {
        node: {
          name: "Exp 2",
          sample: {
            name: "Sample B",
            container: {
              parent: {
                id: "container-parent-id",
                name: "i15-1 robot table",
              },
            },
            data: {
              density: 1.2,
              composition: "CO2",
            },
          },
          experimentDefinition: {
            name: "Def 2",
            data: {
              beam_energy: 20,
              time_per_pdf: 10,
              focused_beam_size: 5,
            },
          },
        },
      },
      {
        node: {
          name: "Exp 3",
          sample: {
            name: "Sample B",
            container: null,
            data: {
              density: 1.2,
              composition: "CO2",
            },
          },
          experimentDefinition: {
            name: "Def 3",
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
};

const testTheme = createTheme();

const renderComponent = () =>
  render(
    <ThemeProvider theme={testTheme}>
      <MemoryRouter>
        <ExperimentList />
      </MemoryRouter>
    </ThemeProvider>,
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

  it("submits selected tasks when clicking 'Add selected ... to queue'", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    mockedUseSubmitTask.mockReturnValue({
      mutateAsync,
    });

    renderComponent();

    const checkbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(checkbox);

    fireEvent.click(
      screen.getByRole("button", { name: /add selected 1 to queue/i }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
      expect(mutateAsync).toHaveBeenCalledWith({
        experiments: [
          {
            name: "Exp 1",
            instrument_session: "",
            experiment_definition: {
              data: { beam_energy: 20, focused_beam_size: 5, time_per_pdf: 10 },
              name: "Def 1",
            },
            sample: {
              data: { composition: "H2O", density: 1.2 },
              name: "Sample A",
              container: {
                parent: null,
              },
            },
          },
        ],
      });
    });
  });

  it("submits all tasks when clicking 'Add all to queue'", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    mockedUseSubmitTask.mockReturnValue({
      mutateAsync,
    });

    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /add all to queue/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
      expect(mutateAsync).toHaveBeenNthCalledWith(1, {
        experiments: [
          {
            name: "Exp 1",
            instrument_session: "",
            sample: {
              name: "Sample A",
              container: {
                parent: null,
              },
              data: {
                density: 1.2,
                composition: "H2O",
              },
            },
            experiment_definition: {
              name: "Def 1",
              data: {
                beam_energy: 20,
                time_per_pdf: 10,
                focused_beam_size: 5,
              },
            },
          },
          {
            name: "Exp 2",
            instrument_session: "",

            sample: {
              name: "Sample B",
              container: {
                parent: {
                  id: "container-parent-id",
                  name: "i15-1 robot table",
                },
              },
              data: {
                density: 1.2,
                composition: "CO2",
              },
            },
            experiment_definition: {
              name: "Def 2",
              data: {
                beam_energy: 20,
                time_per_pdf: 10,
                focused_beam_size: 5,
              },
            },
          },
          {
            name: "Exp 3",
            instrument_session: "",

            sample: {
              name: "Sample B",
              container: null,
              data: {
                density: 1.2,
                composition: "CO2",
              },
            },
            experiment_definition: {
              name: "Def 3",
              data: {
                beam_energy: 20,
                time_per_pdf: 10,
                focused_beam_size: 5,
              },
            },
          },
        ],
      });
    });
  });

  it("highlights rows amber when the sample has no parent", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    const missingParentRow = screen.getByText("Exp 3").closest("tr");
    const hasParentRow = screen.getByText("Exp 2").closest("tr");

    expect(missingParentRow).toHaveStyle({
      backgroundColor: testTheme.palette.warning.light,
    });
    expect(missingParentRow).toHaveAttribute(
      "title",
      "Sample is not in a container",
    );

    expect(hasParentRow).not.toHaveStyle({
      backgroundColor: testTheme.palette.warning.light,
    });
    expect(hasParentRow).not.toHaveAttribute("title");
  });

  it("highlights rows amber when the sample container is not on the robot table", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    const notOnTableRow = screen.getByText("Exp 1").closest("tr");
    const hasParentRow = screen.getByText("Exp 2").closest("tr");

    expect(notOnTableRow).toHaveStyle({
      backgroundColor: testTheme.palette.warning.light,
    });
    expect(notOnTableRow).toHaveAttribute(
      "title",
      "Sample container is not mounted on the robot table",
    );

    expect(hasParentRow).not.toHaveStyle({
      backgroundColor: testTheme.palette.warning.light,
    });
    expect(hasParentRow).not.toHaveAttribute("title");
  });

  it("re-queries with new proposal/session when the instrument session changes", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);
    const { rerender } = render(
      <MemoryRouter>
        <ExperimentList />
      </MemoryRouter>,
    );

    // Initial render uses cm44163-3 → proposal 44163, session 3
    expect(mockedUseQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ variables: { proposal: 44163, session: 3 } }),
    );

    // Switch to a different session
    mockedUseInstrumentSession.mockReturnValue({
      instrumentSession: "cm55555-1",
      setInstrumentSession: vi.fn(),
      sessionsList: ["cm55555-1"],
    });

    rerender(
      <MemoryRouter>
        <ExperimentList />
      </MemoryRouter>,
    );

    // Query should now be called with the new session variables
    expect(mockedUseQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ variables: { proposal: 55555, session: 1 } }),
    );
  });
});
