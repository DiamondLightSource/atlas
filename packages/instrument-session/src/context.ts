import { createContext, useContext } from "react";

export type InstrumentSessionContextType = {
  /** Session to run under, or null if none is available or chosen */
  instrumentSession: string | null;
  setInstrumentSession: (session: string) => void;
  /** Sessions available to the user, or null if not (yet) known */
  instrumentSessionList: string[] | null;
  loading: boolean;
  error: Error | null;
};

export const InstrumentSessionContext = createContext<
  InstrumentSessionContextType | undefined
>(undefined);

export function useInstrumentSession(): InstrumentSessionContextType {
  const context = useContext(InstrumentSessionContext);
  if (!context) {
    throw new Error(
      "useInstrumentSession must be used within InstrumentSessionProvider",
    );
  }
  return context;
}
