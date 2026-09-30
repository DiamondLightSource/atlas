import { Box, IconButton, Paper, Tab, Tabs } from "@mui/material";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";

export type LabelledContent = {
  label: string;
  content: ReactNode;
};
type Props = { children: LabelledContent[]; close: () => void };

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={(theme) => ({
        flex: 1,
        minHeight: 0,
        background: theme.palette.surface.subtle,
      })}
      {...other}
    >
      {children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const OverlayedPanel = ({ children, close }: Props) => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Paper
      sx={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        flexDirection: "column",
        borderTop: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Paper
        sx={(theme) => ({
          display: "flex",
          borderBottom: "1px solid",
          borderColor: "divider",
          alignItems: "center",
          pr: 1.5,
          background: theme.palette.background.default,
        })}
      >
        <Tabs variant="standard" value={value} onChange={handleChange}>
          {children.map((child, index) => (
            <Tab key={index} label={child.label} {...a11yProps(index)} />
          ))}
        </Tabs>
        <Box sx={{ ml: "auto" }}>
          <IconButton
            size="small"
            aria-label="Run command"
            onClick={() => close()}
            sx={{
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </Paper>

      {children.map((child, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {child.content}
        </CustomTabPanel>
      ))}
    </Paper>
  );
};
