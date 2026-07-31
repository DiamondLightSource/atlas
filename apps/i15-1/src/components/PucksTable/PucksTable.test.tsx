import { render, screen, waitFor, userEvent } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PucksTable } from "./PucksTable";
import * as apollo from "@apollo/client/react";

type MockRow = {
  id: string;
  barcode: string;
  session: string;
  parentPosition: number | null;
  status: "Mounted" | "Unmounted";
};

type MockColumn = {
  accessorKey?: string;
  Cell?: (props: {
    cell: { getValue: <T>() => T };
    row: { original: MockRow };
  }) => React.ReactNode;
};

type MockTableOptions = {
  data: MockRow[];
  columns?: MockColumn[];
  state?: {
    isLoading?: boolean;
  };
  muiToolbarAlertBannerProps?: {
    children?: React.ReactNode;
  };
  renderTopToolbarCustomActions?: () => React.ReactNode;
};

type MockTable = {
  options: MockTableOptions;
};

vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apollo/client/react")>();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock("material-react-table", () => ({
  MaterialReactTable: ({ table }: { table: MockTable }) => (
    <div>
      <div data-testid="mock-table">
        {table.options.data.map((row: MockRow) => (
          <div key={row.id}>
            <span>{row.barcode}</span>
            <span>{row.session}</span>
            <span>{row.status}</span>
            {row.parentPosition != null && (
              <span data-testid={`position-${row.id}`}>
                {row.parentPosition}
              </span>
            )}
            {table.options.columns?.map((column, colIdx) =>
              column.Cell ? (
                <div key={colIdx}>
                  {column.Cell({
                    cell: {
                      getValue: <T,>() =>
                        row[column.accessorKey as keyof MockRow] as T,
                    },
                    row: { original: row },
                  })}
                </div>
              ) : null,
            )}
          </div>
        ))}
      </div>

      {table.options.state?.isLoading ? <div role="progressbar" /> : null}
      {table.options.muiToolbarAlertBannerProps?.children ? (
        <div>{table.options.muiToolbarAlertBannerProps.children}</div>
      ) : null}
      {table.options.renderTopToolbarCustomActions?.()}
    </div>
  ),
  useMaterialReactTable: (opts: MockTableOptions) => ({
    options: opts,
    getState: () => ({}),
  }),
}));

const mockedUseQuery = apollo.useQuery as unknown as Mock;
const mockedUseMutation = apollo.useMutation as unknown as Mock;

const mockContainersData = {
  containers: {
    edges: [
      {
        node: {
          id: "019fae86-1551-74f2-b876-f2b5dd4dbb43",
          name: "i15-1 Puck 1234",
          barcode: "i15-1_1234",
          type: {
            name: "i15-1 puck",
          },
          instrumentSessions: [
            {
              instrumentSessionReference: "CM44163-3",
            },
          ],
          parent: {
            name: "i15-1 robot table",
            id: "019fae86-9deb-7c71-ac6b-2a846f4f2bee",
          },
          positionInParent: {
            position: 1,
          },
        },
      },
      {
        node: {
          id: "019fae86-9deb-7c71-ac6b-2a846f4f2bee",
          name: "i15-1 robot table",
          barcode: "i15-1_robot_table",
          type: {
            name: "i15-1 robot table",
          },
          instrumentSessions: [],
          parent: null,
          positionInParent: null,
        },
      },
      {
        node: {
          id: "019fae9b-18b2-7430-ae82-7f6ee0acbf8f",
          name: "i15-1 cupboard 1",
          barcode: "i15-1_cupboard_1",
          type: {
            name: "i15-1 storage cupboard",
          },
          instrumentSessions: [],
          parent: null,
          positionInParent: null,
        },
      },
      {
        node: {
          id: "019faee9-628d-7161-afe4-598a9c60534d",
          name: "i15-1 Puck 56789",
          barcode: "i15-1_56789",
          type: {
            name: "i15-1 puck",
          },
          instrumentSessions: [],
          parent: null,
          positionInParent: null,
        },
      },
    ],
  },
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PucksTable />
    </MemoryRouter>,
  );

describe("PucksTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  it("initialises position dropdown from parentPosition in data", async () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Puck 1234 has positionInParent.position = 1 in the mock data
    await waitFor(() => {
      expect(
        screen.getByTestId("position-019fae86-1551-74f2-b876-f2b5dd4dbb43"),
      ).toHaveTextContent("1");
    });
  });

  it("renders only puck rows", () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    expect(screen.getByText("i15-1_1234")).toBeInTheDocument();
    expect(screen.getByText("i15-1_56789")).toBeInTheDocument();
    expect(screen.queryByText("i15-1_robot_table")).not.toBeInTheDocument();
    expect(screen.queryByText("i15-1_cupboard_1")).not.toBeInTheDocument();
  });

  it("shows Mounted and Unmounted status from parent relation", () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getAllByText("Mounted").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unmounted").length).toBeGreaterThan(0);
  });

  it("shows loading state", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error banner when query fails", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error("Failed to fetch containers"),
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    expect(screen.getByText(/Failed to fetch containers/i)).toBeInTheDocument();
  });

  it("shows Unmount button for a mounted puck that has a position", async () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Puck 1234 is Mounted (parent = robot table) with positionInParent.position = 1
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /unmount/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not show button for an unmounted puck with no position assigned", async () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Puck 56789 has no positionInParent so its button should not appear
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /mark as mounted/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows Mark as mounted button for an unmounted puck that has a position", async () => {
    mockedUseQuery.mockReturnValue({
      data: {
        containers: {
          edges: [
            ...mockContainersData.containers.edges.slice(0, 3),
            {
              node: {
                ...mockContainersData.containers.edges[3].node,
                positionInParent: { position: 3 },
              },
            },
          ],
        },
      },
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    renderComponent();

    // Puck 56789 is Unmounted (no robot table parent) and now has position 3
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark as mounted/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows 'Assign' as a disabled placeholder option in the position dropdown", async () => {
    mockedUseQuery.mockReturnValue({
      data: mockContainersData,
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    const user = userEvent.setup();
    renderComponent();

    // Open the position dropdown for the puck with no position (puck 56789)
    // The select showing "Assign" belongs to that puck
    const comboboxes = await screen.findAllByRole("combobox");
    const assignCombobox = comboboxes.find((el) =>
      el.textContent?.includes("Assign"),
    );
    expect(assignCombobox).toBeDefined();

    await user.click(assignCombobox!);

    // The "Assign" option must be present but disabled so it cannot be chosen
    const assignOption = screen.getByRole("option", { name: /assign/i });
    expect(assignOption).toHaveAttribute("aria-disabled", "true");
  });

  it("calls addPuckToTable mutation with correct variables when Mark as mounted is clicked", async () => {
    const mockMutate = vi.fn();
    mockedUseMutation.mockReturnValue([mockMutate, { loading: false }]);

    mockedUseQuery.mockReturnValue({
      data: {
        containers: {
          edges: [
            ...mockContainersData.containers.edges.slice(0, 3),
            {
              node: {
                ...mockContainersData.containers.edges[3].node,
                positionInParent: { position: 5 },
              },
            },
          ],
        },
      },
      loading: false,
      error: undefined,
    } as unknown as ReturnType<typeof apollo.useQuery>);

    const user = userEvent.setup();
    renderComponent();

    const button = await screen.findByRole("button", {
      name: /mark as mounted/i,
    });
    await user.click(button);

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        barcode: "i15-1_56789",
        tableId: "019fae86-9deb-7c71-ac6b-2a846f4f2bee",
        position: 5,
      },
    });
  });
});
