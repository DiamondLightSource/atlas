import {
  Box,
  IconButton,
  InputBase,
  Paper,
  SvgIcon,
  useTheme,
} from "@mui/material";
import { ChevronRight, Ellipsis, Send } from "lucide-react";
import React, { useRef, useState } from "react";

export type CommandPromptState = "ready" | "evaluating" | "continuation";

export type CommandHandler = (command: string) => void | Promise<void>;

type CommandPromptProps = {
  placeholder: string;
  onSubmit: CommandHandler;
  status?: CommandPromptState;
};

const INDENT_SYMBOL = "    ";

export const CommandPrompt = ({
  placeholder,
  onSubmit,
  status = "ready",
}: CommandPromptProps) => {
  const [command, setCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
   * TODO: Ctrl+C/Cmd+C -> Interrupt
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault(); // prevent the browser's default behaviour for these events
        void submit();
        break;

      case "Tab":
        event.preventDefault();
        setCommand((current) => current + INDENT_SYMBOL);
        break;

      case "c":
        if (event.ctrlKey || event.metaKey) {
          // TODO SIGINT
          break;
        }
        break;
    }
  };
  const theme = useTheme();

  const PromptIcon = isContinuation ? Ellipsis : ChevronRight;
  return (
    <Paper
      square
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
        sx={(theme) => ({
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
        })}
      />
      <Box sx={{ ml: "auto" }}>
        <IconButton
          size="small"
          aria-label="Run command"
          onClick={() => {}}
          disabled={isEvaluating}
        >
          <Send size={18} color={theme.palette.text.disabled} />
        </IconButton>
      </Box>
    </Paper>
  );
};
