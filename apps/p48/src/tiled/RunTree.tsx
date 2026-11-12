import { ProgressDelayed } from "@diamondlightsource/sci-react-ui";
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Grid3x3,
  Table,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { summariseRun } from "./runSummary";
import { MetadataView } from "./MetadataView";
import { PageControls } from "./PageControls";
import type { Selection } from "./selection";
import { PAGE_SIZE, useGetChildren, type TiledNode } from "./tiledService";

const ICON_SIZE = 16;
/** Indentation per level of the tree, in theme spacing units */
const INDENT = 2;

function isExpandable(node: TiledNode) {
  return (
    node.structureFamily === "container" || node.structureFamily === "composite"
  );
}

function getLabel(node: TiledNode) {
  if (node.specs.includes("BlueskyRun")) {
    const { scanId, planName } = summariseRun(node.metadata);
    return {
      primary: `Scan ${scanId ?? "?"} · ${planName ?? "unknown plan"}`,
      secondary: node.id,
    };
  }
  return { primary: node.id, secondary: node.structureFamily };
}

function NodeIcon({ node, open }: { node: TiledNode; open: boolean }) {
  if (isExpandable(node)) {
    return open ? <FolderOpen size={ICON_SIZE} /> : <Folder size={ICON_SIZE} />;
  }
  if (node.structureFamily === "table") return <Table size={ICON_SIZE} />;
  if (node.structureFamily === "array") return <Grid3x3 size={ICON_SIZE} />;
  return <File size={ICON_SIZE} />;
}

/** A loading, error or empty message in place of a level's nodes */
function MessageRow({
  depth,
  children,
  colour = "text.secondary",
}: {
  depth: number;
  children: ReactNode;
  colour?: string;
}) {
  return (
    <ListItem sx={{ pl: 1 + depth * INDENT + 3 }}>
      <Typography component="div" variant="body2" color={colour}>
        {children}
      </Typography>
    </ListItem>
  );
}

function TreeRow({
  depth,
  icon,
  primary,
  secondary,
  expandable,
  open,
  selected = false,
  onClick,
}: {
  depth: number;
  icon: ReactNode;
  primary: string;
  secondary: string;
  expandable: boolean;
  open: boolean;
  selected?: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <ListItemButton
      ref={ref}
      selected={selected}
      aria-expanded={expandable ? open : undefined}
      onClick={onClick}
      sx={{ pl: 1 + depth * INDENT, py: 0.25 }}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: 0.5, width: ICON_SIZE }}>
        {expandable &&
          (open ? (
            <ChevronDown size={ICON_SIZE} />
          ) : (
            <ChevronRight size={ICON_SIZE} />
          ))}
      </ListItemIcon>
      <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary}
        slotProps={{
          primary: { variant: "body2", noWrap: true },
          secondary: { variant: "caption", noWrap: true },
        }}
      />
    </ListItemButton>
  );
}

interface SelectionProps {
  selectedPath: string | null;
  onSelect: (node: TiledNode) => void;
}

function TreeItem({
  node,
  depth,
  initiallyOpen = false,
  selectedPath,
  onSelect,
}: {
  node: TiledNode;
  depth: number;
  initiallyOpen?: boolean;
} & SelectionProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const expandable = isExpandable(node);

  return (
    <>
      <TreeRow
        depth={depth}
        icon={<NodeIcon node={node} open={open} />}
        {...getLabel(node)}
        expandable={expandable}
        open={open}
        selected={selectedPath === node.path}
        onClick={() => {
          onSelect(node);
          if (expandable) setOpen(!open);
        }}
      />
      {expandable && (
        <Collapse in={open} unmountOnExit>
          <TreeLevel
            path={node.path}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        </Collapse>
      )}
    </>
  );
}

function TreeLevel({
  path,
  depth,
  selectedPath,
  onSelect,
}: { path: string; depth: number } & SelectionProps) {
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useGetChildren(path, page);

  return (
    <List dense disablePadding>
      {error && (
        <MessageRow depth={depth} colour="error.main">
          {`Could not fetch from Tiled: ${error.message}`}
        </MessageRow>
      )}
      {isPending && (
        <MessageRow depth={depth}>
          <ProgressDelayed size="small" />
        </MessageRow>
      )}
      {data?.nodes.length === 0 && <MessageRow depth={depth}>Empty</MessageRow>}
      {data?.nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={depth}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
      {data && data.count > PAGE_SIZE && (
        <ListItem sx={{ pl: 1 + depth * INDENT }}>
          <PageControls page={page} count={data.count} onChange={setPage} />
        </ListItem>
      )}
    </List>
  );
}

/** `run` and its streams, beside the selected node's metadata */
export function RunTree({
  run,
  selection,
  onSelect,
}: {
  run: TiledNode;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 300,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        component="nav"
        aria-label="Scan contents"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: "auto",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        <List dense disablePadding>
          <TreeItem
            node={run}
            depth={0}
            initiallyOpen
            selectedPath={selection?.node.path ?? null}
            onSelect={(node) => onSelect({ node })}
          />
        </List>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <MetadataView selection={selection} />
      </Box>
    </Box>
  );
}
