import { useState, useEffect, useContext, type ReactNode } from "react";
import { createContext } from "react";

export const ID_STORAGE_KEY = "instrument-session-id";

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
  sessionsList = ["cm123-4", "cm567-8"],
}: {
  children: ReactNode;
  sessionsList?: string[];
}) => {
  const [instrumentSession, setInstrumentSession] = useState<string>(() => {
    try {
      const rawItem = localStorage.getItem(ID_STORAGE_KEY);
      if (!rawItem) {
        return sessionsList[0];
      }
      return JSON.parse(rawItem);
    } catch (error) {
      console.error(
        "Failed to load instrument session from localStorage:",
        error,
      );
      return sessionsList[0];
    }
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
