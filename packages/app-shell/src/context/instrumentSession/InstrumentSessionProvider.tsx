import { useState, useEffect, useContext, type ReactNode } from "react";
import { createContext } from "react";

export const ID_STORAGE_KEY = "instrument-session-id";
export const LIST_STORAGE_KEY = "instrument-session-list";

export type InstrumentSessionContextType = {
  instrumentSession: string;
  setInstrumentSession: (session: string) => void;
  instrumentSessionList: string[];
  setInstrumentSessionList: (list: string[]) => void;
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
  const [instrumentSessionList, setInstrumentSessionList] = useState<string[]>(
    () => {
      try {
        const rawItem = localStorage.getItem(LIST_STORAGE_KEY);
        if (!rawItem) {
          return sessionsList;
        }
        return JSON.parse(rawItem);
      } catch (error) {
        console.error(
          "Failed to load instrument session from localStorage:",
          error,
        );
        return sessionsList;
      }
    },
  );

  useEffect(() => {
    localStorage.setItem(
      LIST_STORAGE_KEY,
      JSON.stringify(instrumentSessionList),
    );
  }, [instrumentSessionList]);

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
