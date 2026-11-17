import { InstrumentSessionProvider } from "@atlas/app-shell";
import { type PropsWithChildren } from "react";
import { useInstrumentSessions } from "./InstrumentSession";

type Props = { beamline: string } & PropsWithChildren;

export function VisitsProvider(props: Props) {
  const sessions = useInstrumentSessions(props.beamline);

  return (
    <InstrumentSessionProvider sessionsList={sessions}>
      {props.children}
    </InstrumentSessionProvider>
  );
}
