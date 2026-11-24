import { Box } from "@mui/material";
import type { ReactNode } from "react";

// A fieldset, because sci-react-ui's NumberInput has no `disabled` prop
export function FormFieldset({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      component="fieldset"
      disabled={disabled}
      sx={{
        border: 0,
        m: 0,
        p: 0,
        minWidth: 0,
        transition: "opacity 150ms",
        ...(disabled && { opacity: 0.5, pointerEvents: "none" }),
      }}
    >
      {children}
    </Box>
  );
}

export default FormFieldset;
