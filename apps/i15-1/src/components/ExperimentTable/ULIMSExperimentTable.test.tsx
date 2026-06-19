import { render, screen, fireEvent, waitFor } from "@atlas/vitest-conf";
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { ExperimentList } from "./ULIMSExperimentsTable";
import * as apollo from "@apollo/client/react";
import { MemoryRouter } from "react-router-dom";
import * as queueService from "../../queue/queueService";

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
    useSumbitTask: vi.fn(),
  };
});

const mockedUseSubmitTask = queueService.useSumbitTask as unknown as Mock;
const mockedUseQuery = apollo.useQuery as unknown as Mock;

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  mockedUseSubmitTask.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  });
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
        {
          node: {
            name: "Exp 2",
            sample: {
              name: "Sample B",
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
        taskPosition: 0,
        taskParams: {
          experimentName: "Exp 1",
          sampleName: "Sample A",
          density: 1.2,
          composition: "H2O",
          beamEnergy: 20,
          timePerPDF: 10,
          beamSize: 5,
        },
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
      expect(mutateAsync).toHaveBeenCalledTimes(2);
      expect(mutateAsync).toHaveBeenNthCalledWith(1, {
        taskPosition: 0,
        taskParams: {
          experimentName: "Exp 1",
          sampleName: "Sample A",
          density: 1.2,
          composition: "H2O",
          beamEnergy: 20,
          timePerPDF: 10,
          beamSize: 5,
        },
      });
      expect(mutateAsync).toHaveBeenNthCalledWith(2, {
        taskPosition: 1,
        taskParams: {
          experimentName: "Exp 2",
          sampleName: "Sample B",
          density: 1.2,
          composition: "CO2",
          beamEnergy: 20,
          timePerPDF: 10,
          beamSize: 5,
        },
      });
    });
  });
});
