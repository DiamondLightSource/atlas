import { useInstrumentSession } from "@atlas/app-shell";
import { render, screen } from "@atlas/vitest-conf";
import { ScansPage } from "./ScansPage";

vi.mock("@atlas/app-shell", () => ({ useInstrumentSession: vi.fn() }));
vi.mock("./tiled/ScanBrowser", () => ({
  ScanBrowser: ({ session }: { session: string }) => <p>Scans in {session}</p>,
}));

function renderWith(instrumentSession: string | null) {
  vi.mocked(useInstrumentSession).mockReturnValue({
    instrumentSession,
  } as ReturnType<typeof useInstrumentSession>);
  render(<ScansPage />);
}

describe("ScansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the scans in the selected session", () => {
    renderWith("cm44196-1");

    expect(screen.getByText("Scans in cm44196-1")).toBeVisible();
  });

  it("asks for an instrument session when none is selected", () => {
    renderWith(null);

    expect(
      screen.getByText("Select an instrument session to see its scans"),
    ).toBeVisible();
  });
});
