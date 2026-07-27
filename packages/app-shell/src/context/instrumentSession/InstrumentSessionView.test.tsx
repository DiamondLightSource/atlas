import { render, screen } from "@atlas/vitest-conf";
import { InstrumentSessionView } from "./InstrumentSessionView";
import {
  InstrumentSessionProvider,
  useInstrumentSession,
} from "./InstrumentSessionProvider";
import { useState, type ReactNode } from "react";
import { ID_STORAGE_KEY } from "./InstrumentSessionProvider";

function renderComponentWithProvider(children: ReactNode) {
  return <InstrumentSessionProvider>{children}</InstrumentSessionProvider>;
}

// mock use instrument session
const mockIS = ({return localStorage.getItem(ID_STORAGE_KEY)
});
const setMockIS = (instrumentSession: string) => {
  localStorage.setItem(ID_STORAGE_KEY, instrumentSession);
};
const mockUseIS = () => ({
  instrumentSession: mockIS,
  setInstrumentSession: setMockIS,
  sessionsList: ["cm123-4", "cm567-8"],
});
vi.mock("./InstrumentSessionProvider", () => ({
  useInstrumentSession: () => mockUseIS(),
  ID_STORAGE_KEY: "instrument-session-id",
}));

describe("InstrumentSessionView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads instrument session from localStorage", () => {
    localStorage.setItem(ID_STORAGE_KEY, "cm12345-1");
    const { instrumentSession, setInstrumentSession, sessionsList } =
      useInstrumentSession();
    expect(instrumentSession).toBe("cm12345-1");
  });

  //   it("renders the instrument session provided", () => {
  //     localStorage.setItem(ID_STORAGE_KEY, "cm12345-1");
  //     renderComponentWithProvider(<InstrumentSessionView />);
  //     expect(screen.getAllByText("cm12345-1"));
  //   });
});
