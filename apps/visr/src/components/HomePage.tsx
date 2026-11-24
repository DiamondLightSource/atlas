import { Box, Typography } from "@mui/material";
import { green, pink } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import { Lambda, Slice, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { HEADER_HEIGHT } from "./ControlsPane";
import { PLOT_GAP } from "./plotGrid";

const EXPERIMENTS: {
  name: string;
  icon: LucideIcon;
  colour: string;
  to: string;
}[] = [
  {
    name: "Spectroscopy",
    icon: Lambda,
    colour: pink[300],
    to: "/acquisition/spectroscopy",
  },
  {
    name: "Tomography",
    icon: Slice,
    colour: green[400],
    to: "/acquisition/tomography",
  },
];

function ExperimentCard({
  name,
  icon: Icon,
  colour,
  to,
}: (typeof EXPERIMENTS)[0]) {
  return (
    <Box
      component={Link}
      to={to}
      sx={theme => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        minHeight: 240,
        p: 3,
        color: "text.primary",
        textDecoration: "none",
        bgcolor: "action.hover",
        transition: theme.transitions.create(
          ["background-color", "box-shadow", "transform"],
          { duration: theme.transitions.duration.shorter },
        ),
        "& svg": {
          color: colour,
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shorter,
          }),
        },
        "&:hover, &:focus-visible": {
          bgcolor: alpha(colour, 0.1),
          boxShadow: `inset 0 0 0 2px ${colour}, ${theme.shadows[6]}`,
          transform: "translateY(-4px)",
          "& svg": { transform: "scale(1.08)" },
        },
        "&:active": { transform: "translateY(-1px)" },
        "&:focus-visible": { outline: "none" },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover, &:focus-visible, &:active": { transform: "none" },
          "& svg": { transition: "none" },
          "&:hover svg, &:focus-visible svg": { transform: "none" },
        },
      })}
    >
      <Icon size={96} strokeWidth={1.5} aria-hidden />
      <Typography variant="h4" component="span">
        {name}
      </Typography>
    </Box>
  );
}

function HomePage() {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: `${PLOT_GAP}px` }}
    >
      {/* its top lines up with the controls pane's header on the experiment pages */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minHeight: HEADER_HEIGHT,
          px: 3,
          py: 2,
          flexShrink: 0,
          bgcolor: "action.selected",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          fontWeight="var(--ds-font-weight-bold)"
          noWrap
        >
          ViSR
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: `${PLOT_GAP}px`,
        }}
      >
        {EXPERIMENTS.map(experiment => (
          <ExperimentCard key={experiment.name} {...experiment} />
        ))}
      </Box>
    </Box>
  );
}

export default HomePage;
