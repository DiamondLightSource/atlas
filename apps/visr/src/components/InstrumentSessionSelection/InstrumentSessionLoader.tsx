import type { ReactNode } from "react";
import { useInstrumentSessions } from "./InstrumentSession";
import { InstrumentSessionProvider } from "@atlas/app-shell";

import { useAuth } from "@atlas/auth";

export const InstrumentSessionLoader = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    const sessions = useInstrumentSessions().filter(
      (session): session is string => session !== undefined,
    );
    if (sessions.length === 0) {
      sessions.push("0-0");
    }
    return (
      <InstrumentSessionProvider sessionsList={sessions}>
        {children}
      </InstrumentSessionProvider>
    );
  } else {
    return (
      <InstrumentSessionProvider sessionsList={[]}>
        {children}
      </InstrumentSessionProvider>
    );
  }
};
