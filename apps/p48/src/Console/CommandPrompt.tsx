import type { Kernel } from "@jupyterlab/services";
import { Box, IconButton, InputBase, useTheme } from "@mui/material";
import { ChevronRight, Ellipsis, OctagonX, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { usePythonCompletion } from "./usePythonCompletion";
import { AutoCompleteMenu } from "./AutoCompleteMenu";
import { useCommandHistory } from "./useCommandHistory";

export type CommandPromptState =
  "unavailable" | "ready" | "evaluating" | "continuation";

export type CommandHandler = (command: string) => void | Promise<void>;

type CommandPromptProps = {
  placeholder: string;
  onSubmit: CommandHandler;
  status?: CommandPromptState;
  interrupt: () => void;
  kernel: Kernel.IKernelConnection | null;
};

const INDENT_SYMBOL = "    ";

export const CommandPrompt = ({
  placeholder,
  onSubmit,
  status = "ready",
  interrupt,
  kernel,
}: CommandPromptProps) => {
  const [command, setCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { completion, complete, dismiss } = usePythonCompletion(kernel);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);

  const acceptCompletion = (match: string) => {
    if (!completion || !inputRef.current) return;

    const { cursorStart, cursorEnd } = completion;

    const updated =
      command.slice(0, cursorStart) + match + command.slice(cursorEnd);

    setCommand(updated);
    dismiss();
  };

  useEffect(() => {
    setSelectedMatchIndex(0);
  }, [completion]);

  const history = useCommandHistory();

  /** Some other control to focus on to avoid an accessibility trap */
  const submitRef = useRef<HTMLButtonElement>(null);

  const [shouldRetainFocus, setShouldRetainFocus] = useState(false);
  const isEvaluating = status === "evaluating";
  const isContinuation = status === "continuation";
  const isUnavailable = status === "unavailable";

  const submit = async () => {
    if (isEvaluating) {
      return;
    }

    history.push(command);

    await onSubmit(command);
    setCommand("");
  };

  const writeCommand = (cmd: string) => {
    setCommand(cmd ?? "");
  };

  /** Key handler for when autocomplete menu is shown */
  const handleAutocompleteKeyEvent = (
    event: React.KeyboardEvent<HTMLInputElement>,
    matches: string[],
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedMatchIndex((i) => (i + 1) % matches.length);
        return;

      case "ArrowUp":
        event.preventDefault();
        setSelectedMatchIndex((i) => (i - 1 + matches.length) % matches.length);
        return;

      case "Enter":
      case "Tab":
        event.preventDefault();
        acceptCompletion(matches[selectedMatchIndex]!);
        return;

      case "Escape":
        event.preventDefault();
        dismiss();
        return;
    }
  };

  /**
   * Must handle:
   * Enter -> submit
   * Tab -> literal '\t' added to the prompt
   * Escape -> a focus escape hatch for accessibility
   * Up/down -> command history
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return; // these events should come from input element

    if (completion && completion.matches.length > 0) {
      handleAutocompleteKeyEvent(event, completion.matches);
      return;
    }

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
        break;
      case "ArrowUp":
        event.preventDefault();
        {
          const command = history.older();
          if (command !== undefined) {
            writeCommand(command);
          }
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        {
          const command = history.newer();
          if (command !== undefined) {
            writeCommand(command);
          }
        }
        break;
      case " ":
        if (event.ctrlKey || event.metaKey) {
          complete(command, command.length);
        }
        return;
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
    <Box>
      {completion && completion.matches.length > 0 && (
        <AutoCompleteMenu
          acceptCompletion={acceptCompletion}
          matches={completion.matches}
          selectedMatchIndex={selectedMatchIndex}
        />
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <PromptIcon size={18} color={theme.palette.text.secondary} />
        <InputBase
          inputProps={{
            "aria-label": "Python command",
          }}
          inputRef={inputRef}
          fullWidth
          placeholder={placeholder}
          value={command}
          disabled={isEvaluating || isUnavailable}
          onChange={(event) => {
            setCommand(event.target.value);
            setSelectedMatchIndex(0);
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
            disabled={isEvaluating || isUnavailable}
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
            disabled={!isEvaluating || isUnavailable}
            sx={{
              borderRadius: 1,
            }}
          >
            <OctagonX size={18} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
