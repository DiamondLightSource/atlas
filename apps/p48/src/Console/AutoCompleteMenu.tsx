import { Box, Paper, Typography } from "@mui/material";

type AutoCompleteProps = {
  /** Completion suggestions */
  matches: string[];
  /** Current selection */
  selectedMatchIndex: number;
  /** Handler for selected autocompletion */
  acceptCompletion: (completion: string) => void;
};

/** Renders a list of suggestions for autocompletion (generated elsewhere) */
export const AutoCompleteMenu = ({
  matches,
  acceptCompletion,
  selectedMatchIndex,
}: AutoCompleteProps) => {
  return (
    <Paper
      square
      role="listbox"
      aria-label="Completions"
      sx={(theme) => ({
        bottom: 41,
        left: 10,
        right: 10,
        zIndex: 10,
        maxHeight: 200,
        overflowY: "auto",
        py: 0.5,
        background: theme.palette.surface.subtle,
      })}
    >
      {matches.map((match, index) => (
        <Box
          key={match}
          role="option"
          aria-selected={index === selectedMatchIndex}
          onMouseDown={(
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
          ) => {
            // Keep focus in the input while selecting.
            event.preventDefault();
            acceptCompletion(match);
          }}
          sx={(theme) => ({
            px: 1.5,
            py: 0.5,
            cursor: "pointer",
            bgcolor:
              index === selectedMatchIndex
                ? theme.palette.primary.container
                : "transparent",
            "&:hover": {
              bgcolor: "action.hover",
            },
          })}
        >
          <Typography variant="mono2">{match}</Typography>
        </Box>
      ))}
    </Paper>
  );
};
