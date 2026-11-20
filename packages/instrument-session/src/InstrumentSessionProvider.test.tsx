import { act, render, screen, userEvent, waitFor } from "@atlas/vitest-conf";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import { RelayEnvironmentProvider } from "react-relay";
import {
  createMockEnvironment,
  type RelayMockEnvironment,
} from "relay-test-utils";
import { InstrumentSessionProvider } from "./InstrumentSessionProvider";
import { useInstrumentSession } from "./context";
import { storeSession } from "./storage";

function authProvider(loggedIn: boolean): AuthProvider {
  return {
    getUser: async () => (loggedIn ? { id: "abc12345" } : null),
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function sessionsResponse(references: string[]) {
  return {
    data: {
      instrumentByKey: {
        instrumentSessions: {
          edges: references.map((instrumentSessionReference) => ({
            node: { instrumentSessionReference },
          })),
        },
      },
    },
  };
}

function Consumer() {
  const {
    instrumentSession,
    instrumentSessionList,
    setInstrumentSession,
    loading,
    error,
  } = useInstrumentSession();
  return (
    <>
      <span data-testid="session">{instrumentSession ?? "none"}</span>
      <span data-testid="list">
        {instrumentSessionList?.join(",") ?? "null"}
      </span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error?.message ?? "none"}</span>
      {instrumentSessionList?.map((session) => (
        <button key={session} onClick={() => setInstrumentSession(session)}>
          {session}
        </button>
      ))}
    </>
  );
}

function renderQueried(environment: RelayMockEnvironment, loggedIn = true) {
  return render(
    <AuthContextProvider provider={authProvider(loggedIn)}>
      <RelayEnvironmentProvider environment={environment}>
        <InstrumentSessionProvider instrument="I08-1">
          <Consumer />
        </InstrumentSessionProvider>
      </RelayEnvironmentProvider>
    </AuthContextProvider>,
  );
}

async function resolveWith(
  environment: RelayMockEnvironment,
  references: string[],
) {
  await waitFor(() =>
    expect(environment.mock.getAllOperations()).toHaveLength(1),
  );
  act(() =>
    environment.mock.resolveMostRecentOperation(sessionsResponse(references)),
  );
}

describe("InstrumentSessionProvider", () => {
  beforeEach(() => localStorage.clear());

  it("does not query while logged out", async () => {
    const environment = createMockEnvironment();
    renderQueried(environment, false);

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
    expect(environment.mock.getAllOperations()).toHaveLength(0);
    expect(screen.getByTestId("list")).toHaveTextContent("null");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
  });

  it("queries the instrument's sessions once logged in", async () => {
    const environment = createMockEnvironment();
    renderQueried(environment);

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("true"),
    );
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.variables).toEqual({ instrumentKey: "I08-1" });

    await resolveWith(environment, ["CM1-1", "CM2-2"]);
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("list")).toHaveTextContent("cm1-1,cm2-2");
    expect(screen.getByTestId("session")).toHaveTextContent("none");
  });

  it("selects the only session automatically", async () => {
    const environment = createMockEnvironment();
    renderQueried(environment);
    await resolveWith(environment, ["CM1-1"]);
    expect(screen.getByTestId("session")).toHaveTextContent("cm1-1");
  });

  it("restores a stored session that is still available", async () => {
    storeSession("I08-1", "cm2-2");
    const environment = createMockEnvironment();
    renderQueried(environment);
    await resolveWith(environment, ["CM1-1", "CM2-2"]);
    expect(screen.getByTestId("session")).toHaveTextContent("cm2-2");
  });

  it("ignores a stored session that is no longer available", async () => {
    storeSession("I08-1", "cm9-9");
    const environment = createMockEnvironment();
    renderQueried(environment);
    await resolveWith(environment, ["CM1-1", "CM2-2"]);
    expect(screen.getByTestId("session")).toHaveTextContent("none");
  });

  it("remembers the chosen session", async () => {
    const environment = createMockEnvironment();
    renderQueried(environment);
    await resolveWith(environment, ["CM1-1", "CM2-2"]);

    await userEvent.setup().click(screen.getByText("cm2-2"));
    expect(screen.getByTestId("session")).toHaveTextContent("cm2-2");
    expect(localStorage.getItem("instrument-session:I08-1")).toBe("cm2-2");
  });

  it("exposes query errors", async () => {
    const environment = createMockEnvironment();
    renderQueried(environment);
    await waitFor(() =>
      expect(environment.mock.getAllOperations()).toHaveLength(1),
    );
    act(() =>
      environment.mock.rejectMostRecentOperation(new Error("Unavailable")),
    );
    expect(screen.getByTestId("error")).toHaveTextContent("Unavailable");
    expect(screen.getByTestId("list")).toHaveTextContent("null");
  });

  it("uses a fixed sessions list without Relay or auth", () => {
    render(
      <InstrumentSessionProvider instrument="P48" sessions={["cm1-1"]}>
        <Consumer />
      </InstrumentSessionProvider>,
    );
    expect(screen.getByTestId("list")).toHaveTextContent("cm1-1");
    expect(screen.getByTestId("session")).toHaveTextContent("cm1-1");
  });
});
