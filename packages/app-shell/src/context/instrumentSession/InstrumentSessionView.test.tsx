import { render, screen, userEvent, within } from "@atlas/vitest-conf";
import { InstrumentSessionView } from "./InstrumentSessionView";
import {
  InstrumentSessionProvider,
  useInstrumentSession,
} from "./InstrumentSessionProvider";
import { describe, it, expect, vi } from "vitest";

function renderComponentWithProvider() {
  return render(
    <InstrumentSessionProvider>
      <InstrumentSessionView />
    </InstrumentSessionProvider>,
  );
}

// vi.mock(import("./InstrumentSessionProvider"), async (importOriginal) => {
//   const actual =
//     await importOriginal<typeof import("./InstrumentSessionProvider")>();
//   return {
//     ...actual,
//     useInstrumentSession: () => ({
//       instrumentSession: "cm54321-1",
//       setInstrumentSession: vi.fn(),
//       instrumentSessionList: ["cm123-4", "cm567-8"],
//       setInstrumentSessionList: vi.fn(),
//     }),
//   };
// });

vi.mock(import("./InstrumentSessionProvider"), async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./InstrumentSessionProvider")>();
  return {
    ...actual,
    useInstrumentSession: vi.fn(),
  };
});

describe("InstrumentSessionView", () => {
  const mockSetInstrumentSession = vi.fn();
  const mockSetInstrumentSessionList = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows only the current instrument session", () => {
    vi.mocked(useInstrumentSession).mockReturnValue({
      instrumentSession: "cm54321-1",
      setInstrumentSession: vi.fn(),
      instrumentSessionList: ["cm123-4", "cm567-8"],
      setInstrumentSessionList: vi.fn(),
    });

    renderComponentWithProvider();

    expect(screen.getByTestId("session-input-button")).toBeInTheDocument();
    expect(screen.getByTestId("session-input-button")).toHaveTextContent(
      "cm54321-1",
    );
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("shows a static button when only one session is available", () => {
    vi.mocked(useInstrumentSession).mockReturnValue({
      instrumentSession: "cm54321-1",
      setInstrumentSession: vi.fn(),
      instrumentSessionList: ["cm54321-1"],
      setInstrumentSessionList: vi.fn(),
    });

    renderComponentWithProvider();

    expect(
      screen.getByTestId("session-input-staticButton"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("session-input-staticButton")).toHaveTextContent(
      "cm54321-1",
    );
    expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  });

  it("shows no session selected when there is no session selected", () => {
    vi.mocked(useInstrumentSession).mockReturnValue({
      instrumentSession: null,
      setInstrumentSession: vi.fn(),
      instrumentSessionList: ["cm123-4", "cm567-8"],
      setInstrumentSessionList: vi.fn(),
    });

    renderComponentWithProvider();

    expect(screen.getByTestId("session-input-button")).toHaveTextContent(
      "No Session Selected",
    );
  });

  // it("shows sessions from the provided sessions list when clicked", async () => {
  //   vi.mocked(useInstrumentSession).mockReturnValue({
  //     instrumentSession: "cm54321-1",
  //     setInstrumentSession: vi.fn(),
  //     instrumentSessionList: ["cm123-4", "cm567-8"],
  //     setInstrumentSessionList: vi.fn(),
  //   });

  //   renderComponentWithProvider();

  //   const user = userEvent.setup();
  //   await user.click(screen.getByTestId("session-input-button"));
  //   expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();
  //   expect(screen.getByText("cm123-4")).toBeInTheDocument();
  //   expect(screen.getByText("cm567-8")).toBeInTheDocument();
  // });

  // it("closes menu when a menu item has been clicked", async () => {
  //   vi.mocked(useInstrumentSession).mockReturnValue({
  //     instrumentSession: "cm54321-1",
  //     setInstrumentSession: vi.fn(),
  //     instrumentSessionList: ["cm123-4", "cm567-8"],
  //     setInstrumentSessionList: vi.fn(),
  //   });

  //   renderComponentWithProvider();

  //   const user = userEvent.setup();
  //   await user.click(screen.getByTestId("session-input-button"));
  //   expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();

  //   await user.click(screen.getByText("cm123-4"));
  //   expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  // });

  // it("closes menu when button has been clicked again", async () => {
  //   vi.mocked(useInstrumentSession).mockReturnValue({
  //     instrumentSession: "cm54321-1",
  //     setInstrumentSession: vi.fn(),
  //     instrumentSessionList: ["cm123-4", "cm567-8"],
  //     setInstrumentSessionList: vi.fn(),
  //   });

  //   renderComponentWithProvider();

  //   const user = userEvent.setup();
  //   await user.click(screen.getByTestId("session-input-button"));
  //   expect(screen.getByTestId("session-input-menu")).toBeInTheDocument();

  //   const backdrop = screen.getByRole("presentation").firstChild;
  //   if (backdrop instanceof Element) {
  //     await user.click(backdrop);
  //   }
  //   expect(screen.queryByTestId("session-input-menu")).not.toBeInTheDocument();
  // });
});
