import { createContext } from "react";

export type InstrumentSessionContextType = {
  instrumentSession: string;
  setInstrumentSession: (session: string) => void;
};

export const InstrumentSessionContext = createContext<
  InstrumentSessionContextType | undefined
>(undefined);
