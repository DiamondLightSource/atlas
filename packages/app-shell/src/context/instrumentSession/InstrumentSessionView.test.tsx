import { render, screen, userEvent } from "@atlas/vitest-conf";
import { InstrumentSessionView } from "./InstrumentSessionView";
import {
  InstrumentSessionProvider,
  useInstrumentSession,
} from "./InstrumentSessionProvider";
import { useState, type ReactNode } from "react";

function renderComponentWithProvider() {
  return render(
    <InstrumentSessionProvider>
      <InstrumentSessionView />
    </InstrumentSessionProvider>,
  );
}

// mock use instrument session
// const mockUseIS = vi.fn(() => ({
//   instrumentSession: "cm12345-1",
//   setInstrumentSession: vi.fn(),
//   sessionsList: ["cm123-4", "cm567-8"],
// }));
vi.mock(import("./InstrumentSessionProvider"), async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./InstrumentSessionProvider")>();
  return {
    ...actual,
    useInstrumentSession: () => ({
      instrumentSession: "cm12345-1",
      setInstrumentSession: vi.fn(),
      sessionsList: ["cm123-4", "cm567-8"],
    }),
  };
});

describe("InstrumentSessionView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows current instrument session", () => {
    renderComponentWithProvider();
    expect(screen.getByText("cm12345-1")).toBeInTheDocument();
  });

  it("shows sessions from the provided sessions list when clicked", async () => {
    renderComponentWithProvider();

    const user = userEvent.setup();
    await user.click(screen.getByText("cm12345-1"));
    expect(screen.getByText("cm123-4")).toBeInTheDocument();
    expect(screen.getByText("cm567-8")).toBeInTheDocument();
  });
});
