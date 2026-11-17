import { useInstrumentSession } from "@atlas/app-shell";
import { Button } from "@mui/material";
import { useInstrumentSessions } from "./InstrumentSession";

export const InstrumentSessionButton = () => {
  const { setInstrumentSession, setInstrumentSessionList } =
    useInstrumentSession();

  const fetchSessions = useInstrumentSessions().filter(
    (session): session is string => session !== undefined,
  );

  const handleButtonClick = async () => {
    try {
      const sessions = fetchSessions;
      if (sessions.length === 0) {
        sessions.push("0-0");
      }
      setInstrumentSessionList(sessions);
      if (sessions.length == 1) {
        setInstrumentSession(sessions[0]);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };
  return (
    <Button variant="contained" onClick={handleButtonClick}>
      Get Sessions
    </Button>
  );
};
