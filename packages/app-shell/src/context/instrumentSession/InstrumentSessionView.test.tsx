import { render, screen, userEvent, within } from "@atlas/vitest-conf";
import { InstrumentSessionView } from "./InstrumentSessionView";
import { InstrumentSessionProvider } from "./InstrumentSessionProvider";
import { describe, it, expect, vi } from "vitest";

function renderComponentWithProvider() {
  return render(
    <InstrumentSessionProvider>
      <InstrumentSessionView />
    </InstrumentSessionProvider>,
  );
}

vi.mock(import("./InstrumentSessionProvider"), async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./InstrumentSessionProvider")>();
  return {
    ...actual,
    useInstrumentSession: () => ({
      instrumentSession: "cm54321-1",
      setInstrumentSession: vi.fn(),
      sessionsList: ["cm123-4", "cm567-8"],
    }),
  };
});

describe("InstrumentSessionView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows only the current instrument session", () => {
    renderComponentWithProvider();
    expect(screen.getByTestId("session-input-button")).toBeInTheDocument();
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("shows sessions from the provided sessions list when clicked", async () => {
    renderComponentWithProvider();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("session-input-button"));
    expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();
    expect(screen.getByText("cm123-4")).toBeInTheDocument();
    expect(screen.getByText("cm567-8")).toBeInTheDocument();
  });

  it("closes menu when a menu item has been clicked", async () => {
    renderComponentWithProvider();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("session-input-button"));
    expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();

    await user.click(screen.getByText("cm123-4"));
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("closes menu when button has been clicked again", async () => {
    renderComponentWithProvider();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("session-input-button"));
    expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();

    const backdrop = screen.getByRole("presentation").firstChild;
    if (backdrop instanceof Element) {
      await user.click(backdrop);
    }
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });
});
