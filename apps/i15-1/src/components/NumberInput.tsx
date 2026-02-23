import { useState } from "react";
import { TextField } from "@mui/material";

const Modes = {
  /** Natural numbers from 0 to inf */
  natural: /^([0-9]+)$/,
  /** Integers from -inf to inf */
  integer: /^[+\\-]?([0-9]+)$/,
  /** Floating point numbers from -inf to inf, accepts values such as 1. and .1 as valid*/
  floating:
    /^[+\\-]?(([0-9]+)|([0-9]+[\\.])|([\\.][0-9]+)|([0-9]+[\\.][0-9]+))$/,
  /** Floating point numbers from -inf to inf, accepts values such as 1.e1 and .1e1 as valid*/
  scientific:
    /^[+\\-]?(([0-9]+)|([0-9]+[\\.])|([\\.][0-9]+)|([0-9]+[\\.][0-9]+))([eE][+\\-]?[0-9]+)?$/,
};

interface NumberInputTextProps {
  label: string;
  numberMode: keyof typeof Modes;
  numberText: string;
  setNumberText: (v: string) => void;
  isValid: boolean;
  setIsValid: (v: boolean) => void;
  handleCommit?: () => void;
  commitOnReturn?: boolean;
  commitOnBlur?: boolean;
}

const NumberInputText: React.FC<NumberInputTextProps> = ({
  label,
  numberMode,
  numberText,
  setNumberText,
  isValid,
  setIsValid,
  handleCommit,
  commitOnReturn,
  commitOnBlur,
}) => {
  const numberRegex = Modes[numberMode];

  const handleInputChange = (value: string) => {
    setIsValid(numberRegex.test(value));
    setNumberText(value);
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter" && commitOnReturn && isValid && handleCommit) {
      handleCommit();
    }
  };

  const handleBlur = () => {
    if (isValid && commitOnBlur && handleCommit) {
      handleCommit();
    }
  };

  return (
    <TextField
      label={label}
      value={numberText}
      onChange={(e) => handleInputChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      error={!isValid}
      helperText={!isValid ? "Invalid input" : ""}
      variant="outlined"
    />
  );
};

interface NumberInputProps {
  label: string;
  numberMode: keyof typeof Modes;
  defaultValue: number | string;
  onCommit?: (number: number) => void;
  number?: number;
  parameters?: object;
  commitOnReturn?: boolean;
  commitOnBlur?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  numberMode = "floating",
  defaultValue,
  onCommit,
  commitOnReturn = true,
  commitOnBlur = true,
}) => {
  const [numberText, setNumberText] = useState(defaultValue.toString());
  const [isValid, setIsValid] = useState(
    Modes[numberMode].test(defaultValue.toString()),
  );

  const handleCommit = () => {
    const parsedValue: number = parseFloat(numberText);
    if (onCommit) {
      onCommit(parsedValue);
    }
  };

  return (
    <>
      {
        <NumberInputText
          label={label}
          numberMode={numberMode}
          numberText={numberText}
          setNumberText={setNumberText}
          isValid={isValid}
          setIsValid={setIsValid}
          handleCommit={handleCommit}
          commitOnReturn={commitOnReturn}
          commitOnBlur={commitOnBlur}
        />
      }
    </>
  );
};

export { NumberInput };
export type { NumberInputProps };
