import { useInstrumentSession } from "@atlas/app-shell";
import { useAuth } from "@atlas/auth";
import { render, screen } from "@atlas/vitest-conf";
import { Dashboard } from "./Dashboard";

vi.mock("@atlas/app-shell", () => ({ useInstrumentSession: vi.fn() }));
vi.mock("@atlas/auth", () => ({ useAuth: vi.fn() }));
vi.mock("./Console", () => ({ Console: () => <p>Console</p> }));
vi.mock("./tiled/LatestScan", () => ({
  LatestScan: ({ session }: { session: string }) => <p>Latest in {session}</p>,
}));

function renderWith(
  isAuthenticated: boolean,
  instrumentSession: string | null,
) {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated } as ReturnType<
    typeof useAuth
  >);
  vi.mocked(useInstrumentSession).mockReturnValue({
    instrumentSession,
  } as ReturnType<typeof useInstrumentSession>);
  render(<Dashboard />);
}

describe("Dashboard", () => {
  it("shows the latest scan in the selected session", () => {
    renderWith(true, "cm44196-1");

    expect(screen.getByText("Latest in cm44196-1")).toBeVisible();
    expect(screen.getByText("Console")).toBeVisible();
  });

  it.each([
    ["logged out", false, "cm44196-1"],
    ["no session is selected", true, null],
  ])("shows only the console when %s", (_, isAuthenticated, session) => {
    renderWith(isAuthenticated, session);

    expect(screen.queryByText(/Latest in/)).not.toBeInTheDocument();
    expect(screen.getByText("Console")).toBeVisible();
  });
});
