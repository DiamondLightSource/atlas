import { Box, IconButton, InputBase, useTheme } from "@mui/material";
import { ChevronRight, Ellipsis, OctagonX, Send, Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export type CommandPromptState = "ready" | "evaluating" | "continuation";

export type CommandHandler = (command: string) => void | Promise<void>;

type CommandPromptProps = {
  placeholder: string;
  onSubmit: CommandHandler;
  status?: CommandPromptState;
  interrupt: () => void;
};

const INDENT_SYMBOL = "    ";

export const CommandPrompt = ({
  placeholder,
  onSubmit,
  status = "ready",
  interrupt,
}: CommandPromptProps) => {
  const [command, setCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /** Some other control to focus on to avoid an accessibility trap */
  const submitRef = useRef<HTMLButtonElement>(null);

  const [shouldRetainFocus, setShouldRetainFocus] = useState(false);
  const isEvaluating = status === "evaluating";
  const isContinuation = status === "continuation";

  const submit = async () => {
    if (isEvaluating) {
      return;
    }

    await onSubmit(command);
    setCommand("");
  };

  /**
   * Must handle:
   * Enter -> submit
   * Tab -> literal '\t' added to the prompt
   * Escape -> an escape hatch for accessibility
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault(); // prevent the browser's default behaviour for these events
        void submit();
        setShouldRetainFocus(true);
        break;

      case "Tab":
        event.preventDefault();
        setCommand((current) => current + INDENT_SYMBOL);
        break;

      case "Escape":
        setShouldRetainFocus(false);
        submitRef.current?.focus();
    }
  };

  // For a better REPL feel, once we are focused on the prompt,
  // focus stays on the prompt for the next command
  useEffect(() => {
    if (shouldRetainFocus && !isEvaluating) {
      inputRef.current?.focus();
    }
  }, [isEvaluating, shouldRetainFocus]);

  const theme = useTheme();

  const PromptIcon = isContinuation ? Ellipsis : ChevronRight;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 0.5,
      }}
    >
      <PromptIcon size={18} color={theme.palette.text.secondary} />
      <InputBase
        inputRef={inputRef}
        fullWidth
        placeholder={placeholder}
        value={command}
        disabled={isEvaluating}
        onChange={(event) => {
          setCommand(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        sx={{
          "& input": {
            ...theme.typography.mono1,
            color: "text.primary",

            "&::placeholder": {
              color: "text.placeholder",
              opacity: 1,
            },

            "&:focus::placeholder": {
              color: "transparent",
            },
          },
          px: 1,
        }}
      />
      <Box sx={{ ml: "auto", display: "flex" }}>
        <IconButton
          size="small"
          aria-label="Run command"
          ref={submitRef}
          onClick={submit}
          disabled={isEvaluating}
          sx={{
            borderRadius: 1,
          }}
        >
          <Send size={18} />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Interrupt"
          onClick={interrupt}
          disabled={!isEvaluating}
          sx={{
            borderRadius: 1,
          }}
        >
          <OctagonX size={18} />
        </IconButton>
      </Box>
    </Box>
  );
};
