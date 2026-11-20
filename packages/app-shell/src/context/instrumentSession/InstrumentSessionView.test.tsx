import { render, screen, userEvent } from "@atlas/vitest-conf";
import { InstrumentSessionView } from "./InstrumentSessionView";
import {
  useInstrumentSession,
  type InstrumentSessionContextType,
} from "@atlas/instrument-session";
import { describe, it, expect, vi } from "vitest";

vi.mock("@atlas/instrument-session", () => ({
  useInstrumentSession: vi.fn(),
}));

function mockSessions(context: Partial<InstrumentSessionContextType>) {
  const value: InstrumentSessionContextType = {
    instrumentSession: null,
    setInstrumentSession: vi.fn(),
    instrumentSessionList: null,
    loading: false,
    error: null,
    ...context,
  };
  vi.mocked(useInstrumentSession).mockReturnValue(value);
  return value;
}

async function hoverForTooltip() {
  await userEvent
    .setup()
    .hover(screen.getByTestId("session-input-staticButton"));
  return screen.findByRole("tooltip");
}

describe("InstrumentSessionView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the current session with a menu when several are available", () => {
    mockSessions({
      instrumentSession: "cm123-4",
      instrumentSessionList: ["cm123-4", "cm567-8"],
    });

    render(<InstrumentSessionView />);

    expect(screen.getByTestId("session-input-button")).toHaveTextContent(
      "cm123-4",
    );
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("asks for a session to be selected when several are available", () => {
    mockSessions({ instrumentSessionList: ["cm123-4", "cm567-8"] });

    render(<InstrumentSessionView />);

    expect(screen.getByTestId("session-input-button")).toHaveTextContent(
      "Select Session",
    );
  });

  it("shows a static button when only one session is available", () => {
    mockSessions({
      instrumentSession: "cm54321-1",
      instrumentSessionList: ["cm54321-1"],
    });

    render(<InstrumentSessionView />);

    expect(screen.getByTestId("session-input-staticButton")).toHaveTextContent(
      "cm54321-1",
    );
  });

  it("lists the available sessions, marking the current one", async () => {
    mockSessions({
      instrumentSession: "cm567-8",
      instrumentSessionList: ["cm123-4", "cm567-8"],
    });

    render(<InstrumentSessionView />);

    await userEvent.setup().click(screen.getByTestId("session-input-button"));
    expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "cm123-4" })).not.toHaveClass(
      "Mui-selected",
    );
    expect(screen.getByRole("menuitem", { name: "cm567-8" })).toHaveClass(
      "Mui-selected",
    );
  });

  it("selects a session and closes the menu when one is clicked", async () => {
    const { setInstrumentSession } = mockSessions({
      instrumentSession: "cm567-8",
      instrumentSessionList: ["cm123-4", "cm567-8"],
    });

    render(<InstrumentSessionView />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("session-input-button"));
    await user.click(screen.getByText("cm123-4"));
    expect(setInstrumentSession).toHaveBeenCalledWith("cm123-4");
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("closes the menu when the backdrop is clicked", async () => {
    mockSessions({
      instrumentSession: "cm123-4",
      instrumentSessionList: ["cm123-4", "cm567-8"],
    });

    render(<InstrumentSessionView />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("session-input-button"));
    expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();

    const backdrop = screen.getByRole("presentation").firstChild;
    if (backdrop instanceof Element) {
      await user.click(backdrop);
    }
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("asks the user to log in when sessions are unknown", async () => {
    mockSessions({});

    render(<InstrumentSessionView />);

    expect(screen.getByTestId("session-input-staticButton")).toHaveTextContent(
      "No Session Selected",
    );
    expect(await hoverForTooltip()).toHaveTextContent(
      "Log in to see your sessions.",
    );
  });

  it("explains when there are no sessions in progress", async () => {
    mockSessions({ instrumentSessionList: [] });

    render(<InstrumentSessionView />);

    expect(await hoverForTooltip()).toHaveTextContent(
      "You have no sessions in progress on this instrument.",
    );
  });

  it("shows when sessions are loading", async () => {
    mockSessions({ loading: true });

    render(<InstrumentSessionView />);

    expect(await hoverForTooltip()).toHaveTextContent("Loading sessions...");
  });

  it("shows why sessions failed to load", async () => {
    mockSessions({ error: new Error("Unavailable") });

    render(<InstrumentSessionView />);

    expect(await hoverForTooltip()).toHaveTextContent(
      "Failed to load sessions: Unavailable",
    );
  });
});
