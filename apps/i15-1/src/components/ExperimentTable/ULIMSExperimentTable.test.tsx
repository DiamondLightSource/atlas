import { render, screen, fireEvent, waitFor } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { ExperimentList } from "./ULIMSExperimentsTable";
import * as apollo from "@apollo/client/react";
import { MemoryRouter } from "react-router-dom";
import * as queueService from "../../queue/queueService";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as instrumentSession from "@atlas/instrument-session";

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

vi.mock("@atlas/instrument-session", () => ({
  useInstrumentSession: vi.fn(),
}));

const mockedUseSubmitTask = queueService.useSumbitQueueTasks as unknown as Mock;
const mockedUseQuery = apollo.useQuery as unknown as Mock;
const mockedUseInstrumentSession =
  instrumentSession.useInstrumentSession as unknown as Mock;

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  mockedUseSubmitTask.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  });
  mockedUseInstrumentSession.mockReturnValue({
    instrumentSession: "cm44163-3",
    setInstrumentSession: vi.fn(),
    instrumentSessionList: ["cm44163-3"],
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
              // list_of_temperatures: [110]  // in C for blower
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
              list_of_temperatures: [100, 120],
              ramp_rate: 5,
              settle_time: 10,
            },
          },
        },
      },
    ],
    pageInfo: { hasNextPage: false, endCursor: "cursor-3" },
  },
};

const testTheme = createTheme();

const renderComponent = () =>
  render(<ExperimentList />, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={testTheme}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    ),
  });

describe("ExperimentList", () => {
  it("fetches and appends successive pages until there are no more experiments", async () => {
    const fetchMore = vi.fn().mockResolvedValue({});
    const firstPage = {
      experiments: {
        ...mockExperiments.experiments,
        pageInfo: { hasNextPage: true, endCursor: "cursor-3" },
      },
    };
    mockedUseQuery.mockReturnValue({
      data: firstPage,
      loading: false,
      fetchMore,
    });

    const { rerender } = renderComponent();

    await waitFor(() => expect(fetchMore).toHaveBeenCalledTimes(1));
    expect(fetchMore.mock.calls[0][0].variables).toEqual({ after: "cursor-3" });

    const nextPage = {
      experiments: {
        edges: [
          {
            node: {
              ...mockExperiments.experiments.edges[1].node,
              name: "Exp 4",
            },
          },
        ],
        pageInfo: { hasNextPage: true, endCursor: "cursor-4" },
      },
    };
    const merged = fetchMore.mock.calls[0][0].updateQuery(firstPage, {
      fetchMoreResult: nextPage,
    });
    expect(merged.experiments.edges).toEqual([
      ...firstPage.experiments.edges,
      ...nextPage.experiments.edges,
    ]);
    expect(merged.experiments.pageInfo).toEqual(nextPage.experiments.pageInfo);

    mockedUseQuery.mockReturnValue({ data: merged, loading: false, fetchMore });
    rerender(<ExperimentList />);

    await waitFor(() => expect(fetchMore).toHaveBeenCalledTimes(2));
    expect(fetchMore.mock.calls[1][0].variables).toEqual({ after: "cursor-4" });
    expect(screen.getByText("Exp 1")).toBeInTheDocument();
    expect(screen.getByText("Exp 4")).toBeInTheDocument();

    const finalPage = {
      experiments: {
        edges: [
          {
            node: {
              ...mockExperiments.experiments.edges[1].node,
              name: "Exp 5",
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: "cursor-5" },
      },
    };
    const allPages = fetchMore.mock.calls[1][0].updateQuery(merged, {
      fetchMoreResult: finalPage,
    });
    mockedUseQuery.mockReturnValue({ data: allPages, loading: false, fetchMore });
    rerender(<ExperimentList />);

    expect(screen.getByText("Exp 5")).toBeInTheDocument();
    expect(fetchMore).toHaveBeenCalledTimes(2);
  });

  it.each([
    { loading: true, hasNextPage: true, endCursor: "cursor-3" },
    { loading: false, hasNextPage: false, endCursor: "cursor-3" },
    { loading: false, hasNextPage: true, endCursor: null },
  ])("does not fetch another page for %j", ({ loading, ...pageInfo }) => {
    const fetchMore = vi.fn();
    mockedUseQuery.mockReturnValue({
      data: { experiments: { ...mockExperiments.experiments, pageInfo } },
      loading,
      fetchMore,
    });

    renderComponent();

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it("shows pagination errors without discarding loaded experiments or retrying", async () => {
    const fetchMore = vi.fn().mockRejectedValue(new Error("Next page failed"));
    mockedUseQuery.mockReturnValue({
      data: {
        experiments: {
          ...mockExperiments.experiments,
          pageInfo: { hasNextPage: true, endCursor: "cursor-3" },
        },
      },
      loading: false,
      fetchMore,
    });

    renderComponent();

    expect(await screen.findByText(/Next page failed/)).toBeInTheDocument();
    expect(screen.getByText("Exp 1")).toBeInTheDocument();
    expect(fetchMore).toHaveBeenCalledTimes(1);
  });

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

    const { container } = renderComponent();

    // MRT shows skeleton rows (and no spinner) while loading
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows a progress bar, not skeletons, when refetching with data", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: true,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    const { container } = renderComponent();

    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
    expect(
      container.querySelector(".MuiSkeleton-root"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Exp 1")).toBeInTheDocument();
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

  it("disables queue submission while an add request is pending", () => {
    const mutateAsync = vi.fn();
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);
    mockedUseSubmitTask.mockReturnValue({
      mutateAsync,
      isPending: true,
    });

    renderComponent();

    const addButton = screen.getByRole("button", {
      name: /add all to queue/i,
    });
    expect(addButton).toBeDisabled();
    fireEvent.click(addButton);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("changes button text when a row is selected", () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Click row checkbox (MRT adds checkboxes automatically)
    const checkbox = screen.getAllByRole("checkbox")[0];
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

    mockedUseSubmitTask.mockReturnValue({ mutateAsync, isPending: false });

    renderComponent();

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    fireEvent.click(
      screen.getByRole("button", { name: /add selected 1 to queue/i }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
      expect(mutateAsync).toHaveBeenCalledWith({
        experiments: [
          {
            name: "Exp 2",
            instrument_session: "",
            experiment_definition: {
              data: { beam_energy: 20, focused_beam_size: 5, time_per_pdf: 10 },
              name: "Def 2",
            },
            sample: {
              data: { composition: "CO2", density: 1.2 },
              name: "Sample B",
              container: {
                parent: {
                  id: "container-parent-id",
                  name: "i15-1 robot table",
                },
              },
            },
          },
        ],
      });
      const alerts = screen.getAllByRole("alert");
      // Table alert
      expect(alerts[0]).toHaveTextContent("1 of 3 row(s) selected");
      // Snackbar
      expect(alerts[1]).toHaveTextContent("1 task(s) added to queue");
    });
  });

  it("submits all valid tasks when clicking 'Add all to queue'", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    mockedUseSubmitTask.mockReturnValue({ mutateAsync, isPending: false });

    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /add all to queue/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
      expect(mutateAsync).toHaveBeenNthCalledWith(1, {
        experiments: [
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
        ],
      });
      const alerts = screen.getAllByRole("alert");
      // Table alert
      expect(alerts[0]).toHaveTextContent("1 of 3 row(s) selected");
      // Snackbar
      expect(alerts[1]).toHaveTextContent("All tasks (1) added to queue");
    });
  });

  it("shows alert with error message when submission to queue fails", async () => {
    mockedUseQuery.mockReturnValue({
      data: mockExperiments,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);
    mockedUseSubmitTask.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error("request failed")),
      isPending: false,
    });

    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /add all to queue/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts[1]).toHaveTextContent(
        "Could not submit selected tasks to queue",
      );
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

  it("does not highlight skeleton rows as invalid while loading", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    const { container } = renderComponent();

    const skeletonRow = container
      .querySelector(".MuiSkeleton-root")
      ?.closest("tr");

    expect(skeletonRow).toBeInTheDocument();
    expect(skeletonRow).not.toHaveStyle({
      backgroundColor: testTheme.palette.warning.light,
    });
    expect(skeletonRow).not.toHaveAttribute("title");
  });

  it("disables selection and 'Add all to queue' while loading with no rows", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox).toBeDisabled();
    }
    expect(
      screen.getByRole("button", { name: /Add all to queue/ }),
    ).toBeDisabled();
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
      expect.objectContaining({
        variables: { proposal: 44163, session: 3, first: 50 },
      }),
    );

    // Switch to a different session
    mockedUseInstrumentSession.mockReturnValue({
      instrumentSession: "cm55555-1",
      setInstrumentSession: vi.fn(),
      instrumentSessionList: ["cm55555-1"],
    });

    rerender(
      <MemoryRouter>
        <ExperimentList />
      </MemoryRouter>,
    );

    // Query should now be called with the new session variables
    expect(mockedUseQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { proposal: 55555, session: 1, first: 50 },
      }),
    );
  });
});
