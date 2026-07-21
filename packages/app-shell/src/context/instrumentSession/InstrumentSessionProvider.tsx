import { useState, useEffect, useContext, type ReactNode } from "react";
// import { InstrumentSessionContext } from "./InstrumentSessionContext";
import { createContext } from "react";

const STORAGE_KEY = "instrument-session-id";

export type InstrumentSessionContextType = {
  instrumentSession: string;
  setInstrumentSession: (session: string) => void;
};

export const InstrumentSessionContext = createContext<
  InstrumentSessionContextType | undefined
>(undefined);

export const InstrumentSessionProvider = ({
  children,
  defaultSessionId = "cm12345-1",
}: {
  children: ReactNode;
  defaultSessionId?: string;
}) => {
  const [instrumentSession, setInstrumentSession] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? defaultSessionId;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, instrumentSession);
  }, [instrumentSession]);

  return (
    <InstrumentSessionContext.Provider
      value={{ instrumentSession, setInstrumentSession }}
    >
      {children}
    </InstrumentSessionContext.Provider>
  );
};

export const useInstrumentSession = () => {
  const context = useContext(InstrumentSessionContext);
  if (!context) {
    throw new Error(
      "useInstrumentSession must be used within InstrumentSessionProvider",
    );
  }
  return context;
};
