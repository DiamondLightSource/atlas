import { useState, useEffect, useContext, type ReactNode } from "react";
import { createContext } from "react";

export const ID_STORAGE_KEY = "instrument-session-id";
export const LIST_STORAGE_KEY = "instrument-session-list";

export type InstrumentSessionContextType = {
  instrumentSession: string | null;
  setInstrumentSession: (session: string) => void;
  instrumentSessionList: string[] | null;
  setInstrumentSessionList: (list: string[]) => void;
};

export const InstrumentSessionContext = createContext<
  InstrumentSessionContextType | undefined
>(undefined);

export const InstrumentSessionProvider = ({
  children,
  sessionsList = null,
}: {
  children: ReactNode;
  sessionsList?: string[] | null;
}) => {
  const [instrumentSessionList, setInstrumentSessionList] = useState<
    string[] | null
  >(sessionsList);

  useEffect(() => {
    localStorage.setItem(
      LIST_STORAGE_KEY,
      JSON.stringify(instrumentSessionList),
    );
  }, [instrumentSessionList]);

  const [instrumentSession, setInstrumentSession] = useState<string | null>(
    () => {
      try {
        const rawItem = localStorage.getItem(ID_STORAGE_KEY);
        if (!rawItem) {
          return sessionsList ? sessionsList[0] : null;
        }
        return rawItem;
      } catch (error) {
        console.error(
          "Failed to load instrument session from localStorage:",
          error,
        );
        return sessionsList ? sessionsList[0] : null;
      }
    },
  );

  useEffect(() => {
    localStorage.setItem(ID_STORAGE_KEY, JSON.stringify(instrumentSession));
  }, [instrumentSession]);

  return (
    <InstrumentSessionContext.Provider
      value={{
        instrumentSession,
        setInstrumentSession,
        instrumentSessionList,
        setInstrumentSessionList,
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
