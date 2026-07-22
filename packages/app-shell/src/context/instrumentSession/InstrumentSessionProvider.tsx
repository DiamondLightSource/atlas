import { useState, useEffect, useContext, type ReactNode } from "react";
import { createContext } from "react";

const ID_STORAGE_KEY = "instrument-session-id";
const LIST_STORAGE_KEY = "instrument-session-list";

export type InstrumentSessionContextType = {
  instrumentSession: string;
  setInstrumentSession: (session: string) => void;
  sessionsList: string[];
};

export const InstrumentSessionContext = createContext<
  InstrumentSessionContextType | undefined
>(undefined);

export const InstrumentSessionProvider = ({
  children,
  defaultSessionId = "cm12345-1",
  sessionsList = ["cm12345-2", "cm12345-2"],
}: {
  children: ReactNode;
  defaultSessionId?: string;
  sessionsList?: string[];
}) => {
  const [instrumentSession, setInstrumentSession] = useState<string>(() => {
    return localStorage.getItem(ID_STORAGE_KEY) ?? defaultSessionId;
  });

  useEffect(() => {
    localStorage.setItem(ID_STORAGE_KEY, instrumentSession);
  }, [instrumentSession]);

  return (
    <InstrumentSessionContext.Provider
      value={{
        instrumentSession,
        setInstrumentSession,
        sessionsList,
      }}
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
