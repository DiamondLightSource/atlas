import type { Kernel } from "@jupyterlab/services";
import { Box, IconButton, InputBase, Paper, useTheme } from "@mui/material";
import { ChevronRight, Ellipsis, OctagonX, Send, Settings } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePythonCompletion } from "./usePythonCompletion";

export type CommandPromptState = "ready" | "evaluating" | "continuation";

export type CommandHandler = (command: string) => void | Promise<void>;

/** This could eventually be replaced with the kernel's own history */
const commandHistory: string[] = [];
let historyIndex = 0;

/** Get historical command with position from most recent */
function getCommandFromHistory(position: number) {
  const cmd = commandHistory[commandHistory.length - position];
  console.log(`Retrieving ${position}th most recent command, ${cmd}`);
  return cmd;
}

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

  const [selectedIndex, setSelectedIndex] = useState(0);

  const acceptCompletion = (match: string) => {
    if (!completion || !inputRef.current) return;

    const { cursorStart, cursorEnd } = completion;

    const updated =
      command.slice(0, cursorStart) + match + command.slice(cursorEnd);

    const cursor = cursorStart + match.length;

    setCommand(updated);
    dismiss();

    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(cursor, cursor);
      inputRef.current?.focus();
    });
  };

  /** Some other control to focus on to avoid an accessibility trap */
  const submitRef = useRef<HTMLButtonElement>(null);

  const [shouldRetainFocus, setShouldRetainFocus] = useState(false);
  const isEvaluating = status === "evaluating";
  const isContinuation = status === "continuation";

  const submit = async () => {
    if (isEvaluating) {
      return;
    }

    commandHistory.push(command);
    historyIndex = 0;

    await onSubmit(command);
    setCommand("");
  };

  const writeCommand = (cmd: string) => {
    setCommand(cmd ?? "");
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
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) => (i + 1) % completion.matches.length);
          return;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex(
            (i) =>
              (i - 1 + completion.matches.length) % completion.matches.length,
          );
          return;

        case "Enter":
        case "Tab":
          event.preventDefault();
          acceptCompletion(completion.matches[selectedIndex]!);
          return;

        case "Escape":
          event.preventDefault();
          dismiss();
          return;
      }
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
        if (historyIndex > commandHistory.length - 1) return;
        historyIndex += 1;
        writeCommand(getCommandFromHistory(historyIndex));
        break;
      case "ArrowDown":
        event.preventDefault();
        if (historyIndex < 1) return;
        historyIndex -= 1;
        writeCommand(getCommandFromHistory(historyIndex));
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
          setSelectedIndex(0);
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
      {completion && completion.matches.length > 0 && (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: 200,
            overflowY: "auto",
            py: 0.5,
          }}
        >
          {completion.matches.map((match, index) => (
            <Box
              key={match}
              onMouseDown={(event) => {
                // Keep focus in the input while selecting.
                event.preventDefault();
                acceptCompletion(match);
              }}
              sx={(theme) => ({
                px: 1.5,
                py: 0.5,
                cursor: "pointer",
                fontFamily: theme.typography.mono1,
                bgcolor:
                  index === selectedIndex ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              })}
            >
              {match}
            </Box>
          ))}
        </Paper>
      )}
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
