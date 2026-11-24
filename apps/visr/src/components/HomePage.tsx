import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { Lambda, Slice, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { PLOT_GAP } from "./plotGrid";

const EXPERIMENTS: {
  name: string;
  icon: LucideIcon;
  to: string;
}[] = [
  { name: "Spectroscopy", icon: Lambda, to: "/acquisition/spectroscopy" },
  { name: "Tomography", icon: Slice, to: "/acquisition/tomography" },
];

function ExperimentCard({ name, icon: Icon, to }: (typeof EXPERIMENTS)[0]) {
  return (
    <Card
      elevation={0}
      square
      sx={theme => ({
        bgcolor: "primary.container",
        color: "primary.onContainer",
        transition: theme.transitions.create("box-shadow", {
          duration: theme.transitions.duration.shorter,
        }),
        "&:hover, &:has(.Mui-focusVisible)": {
          boxShadow: "inset 0 0 0 9999px var(--ds-overlay-hover)",
        },
        // on the card, not the action area: the card's overflow would clip it
        "&:has(.Mui-focusVisible)": {
          outline: "var(--ds-focus-ring-width) solid var(--ds-focus-ring)",
          outlineOffset: "var(--ds-focus-ring-offset)",
        },
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      })}
    >
      <CardActionArea
        component={Link}
        to={to}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: 240,
          p: 3,
          "& .MuiCardActionArea-focusHighlight": { display: "none" },
        }}
      >
        <Icon size={96} strokeWidth={1.5} aria-hidden />
        <Typography variant="h4" component="span">
          {name}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function HomePage() {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: `${PLOT_GAP}px` }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h2Display" component="h1" noWrap>
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
