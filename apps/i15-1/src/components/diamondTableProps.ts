import { DiamondDSIntegrations } from "@diamondlightsource/sci-react-ui";
import { fillParentTableProps } from "./fillParentTableProps";

const diamondDSOptions = DiamondDSIntegrations.mrtOptions({ fullWidth: true });

// DiamondDS props shared by the MRT tables.
export const diamondTableProps = {
  // MRT's lighten/darken breaks on DiamondDS CSS-variable tokens.
  mrtTheme: DiamondDSIntegrations.mrtTheme,
  ...diamondDSOptions,
  muiTablePaperProps: {
    ...diamondDSOptions.muiTablePaperProps,
    // fullWidth squares the panel; restore its corners and clip the table to them.
    sx: {
      ...diamondDSOptions.muiTablePaperProps.sx,
      borderRadius: 2,
      overflow: "hidden",
    },
  },
  // TODO: drop once DiamondDSIntegrations covers MRT's hardcoded toolbar boxShadow.
  muiBottomToolbarProps: { sx: { boxShadow: "none" } },
} as const;

// As above, for tables that fill their parent and scroll rows inside.
export const diamondFillParentTableProps = {
  ...diamondTableProps,
  ...fillParentTableProps,
  muiTablePaperProps: {
    ...diamondTableProps.muiTablePaperProps,
    sx: {
      ...diamondTableProps.muiTablePaperProps.sx,
      ...fillParentTableProps.muiTablePaperProps.sx,
    },
  },
  // Merge so DiamondDS's `border: none` isn't lost.
  muiTableContainerProps: {
    ...diamondTableProps.muiTableContainerProps,
    sx: {
      ...diamondTableProps.muiTableContainerProps?.sx,
      ...fillParentTableProps.muiTableContainerProps.sx,
    },
  },
} as const;
