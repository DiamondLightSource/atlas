import { Box } from "@mui/material";
import { useRef, type RefObject } from "react";

interface HeightHandleProps {
  /** The element whose height the handle sets (it sits on its bottom edge) */
  target: RefObject<HTMLElement | null>;
  /** The height set, or null while it is automatic */
  value: number | null;
  /** The new height in pixels, or null to go back to the automatic height */
  onChange: (height: number | null) => void;
  min?: number;
  max?: number;
  label: string;
}

/** Pixels moved by each arrow key press */
const KEY_STEP = 20;

/**
 * A horizontal line that can be dragged up and down to set the height of the
 * element above it. Arrow keys move it too, and a double click (or Escape)
 * goes back to the automatic height.
 */
function HeightHandle({
  target,
  value,
  onChange,
  min = 150,
  max = 2000,
  label,
}: HeightHandleProps) {
  const drag = useRef<{ y: number; height: number } | null>(null);
  const clamp = (h: number) => Math.round(Math.min(max, Math.max(min, h)));
  const current = () => target.current?.getBoundingClientRect().height ?? min;

  return (
    <Box
      role="separator"
      aria-orientation="horizontal"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? undefined}
      tabIndex={0}
      title="Drag to resize; double-click to reset"
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { y: e.clientY, height: current() };
        e.preventDefault(); // no text selection while dragging
      }}
      onPointerMove={e => {
        if (!drag.current) return;
        onChange(clamp(drag.current.height + e.clientY - drag.current.y));
      }}
      onPointerUp={e => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        drag.current = null;
      }}
      onDoubleClick={() => onChange(null)}
      onKeyDown={e => {
        const step = { ArrowUp: -KEY_STEP, ArrowDown: KEY_STEP }[e.key];
        if (step) {
          onChange(clamp(current() + step));
          e.preventDefault();
        } else if (e.key === "Escape") {
          onChange(null);
        }
      }}
      sx={{
        // straddles the line below it, so it is easy to grab
        height: 10,
        my: "-5px",
        position: "relative",
        zIndex: 1,
        flexShrink: 0,
        cursor: "row-resize",
        touchAction: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          top: 4,
          height: 2,
          bgcolor: "transparent",
          transition: "background-color 0.15s",
        },
        "&:hover::after, &:focus-visible::after, &:active::after": {
          bgcolor: "primary.main",
        },
        outline: "none",
      }}
    />
  );
}

export default HeightHandle;
