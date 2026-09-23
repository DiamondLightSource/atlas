import { Container, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import QueueIcon from "@mui/icons-material/Queue";
import { useUserAuth } from "../context/userAuth/useUserAuth.ts";
import { User } from "@diamondlightsource/sci-react-ui";
import { InstrumentSessionButton } from "../components/getInstrumentSessionButton.tsx";
import { Console } from "@atlas/blueapi-ui";

function Dashboard() {
  const user = useUserAuth();

  const handleLogIn = () => window.location.assign("/oauth2/sign_in");
  const handleLogOut = () => window.location.assign("/oauth2/sign_out");

  return <Console />;
}

export default Dashboard;
