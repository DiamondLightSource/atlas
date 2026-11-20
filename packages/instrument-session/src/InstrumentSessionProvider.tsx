import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useRelayEnvironment } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { useAuth } from "@atlas/auth";
import query, {
  type InstrumentSessionQuery,
  type InstrumentSessionQuery$data,
} from "./__generated__/InstrumentSessionQuery.graphql";
import { InstrumentSessionContext } from "./context";
import { loadStoredSession, resolveSession, storeSession } from "./storage";

type Props = PropsWithChildren<{
  /** Instrument key as known to the supergraph, e.g. "I08-1" */
  instrument: string;
  /**
   * Fixed list of sessions to use instead of querying the supergraph.
   * When given, no Relay environment is required.
   */
  sessions?: string[];
}>;

export function InstrumentSessionProvider({
  instrument,
  sessions,
  children,
}: Props) {
  if (sessions) {
    return (
      <SessionSelection
        instrument={instrument}
        sessions={sessions}
        loading={false}
        error={null}
      >
        {children}
      </SessionSelection>
    );
  }
  return <QueriedSessions instrument={instrument}>{children}</QueriedSessions>;
}

type QueryState =
  | { status: "idle" | "loading" }
  | { status: "success"; sessions: string[] }
  | { status: "error"; error: Error };

/** Fetches the user's in-progress sessions on the instrument once logged in */
function QueriedSessions({
  instrument,
  children,
}: PropsWithChildren<{ instrument: string }>) {
  const { isAuthenticated } = useAuth();
  const environment = useRelayEnvironment();
  const [state, setState] = useState<QueryState>({ status: "idle" });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    const subscription = fetchQuery<InstrumentSessionQuery>(
      environment,
      query,
      { instrumentKey: instrument },
    ).subscribe({
      next: (data) =>
        setState({ status: "success", sessions: toSessions(data) }),
      error: (error: Error) => setState({ status: "error", error }),
    });
    return () => subscription.unsubscribe();
  }, [environment, instrument, isAuthenticated]);

  return (
    <SessionSelection
      instrument={instrument}
      sessions={state.status === "success" ? state.sessions : null}
      loading={state.status === "loading"}
      error={state.status === "error" ? state.error : null}
    >
      {children}
    </SessionSelection>
  );
}

function toSessions(data: InstrumentSessionQuery$data): string[] {
  return (
    data.instrumentByKey?.instrumentSessions.edges.flatMap((edge) => {
      const reference = edge.node.instrumentSessionReference;
      return reference ? [reference.toLowerCase()] : [];
    }) ?? []
  );
}

type SelectionProps = PropsWithChildren<{
  instrument: string;
  sessions: string[] | null;
  loading: boolean;
  error: Error | null;
}>;

/** Tracks which of the available sessions is in use, remembered per instrument */
function SessionSelection({
  instrument,
  sessions,
  loading,
  error,
  children,
}: SelectionProps) {
  const [stored, setStored] = useState(() => loadStoredSession(instrument));

  const setInstrumentSession = useCallback(
    (session: string) => {
      setStored(session);
      storeSession(instrument, session);
    },
    [instrument],
  );

  const value = useMemo(
    () => ({
      instrumentSession: resolveSession(stored, sessions),
      setInstrumentSession,
      instrumentSessionList: sessions,
      loading,
      error,
    }),
    [stored, sessions, setInstrumentSession, loading, error],
  );

  return (
    <InstrumentSessionContext.Provider value={value}>
      {children}
    </InstrumentSessionContext.Provider>
  );
}
