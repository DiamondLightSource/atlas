import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { StatusColour } from "./runSummary";

// A stand-in for sci-react-ui's proposed ContextPanel (sci-react-ui#375),
// following its interface so it can be swapped for it once released

export interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: { label: string; colour: StatusColour };
  metadata?: { key: string; label: string; value: ReactNode }[];
}

export interface PanelFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  /** "" for no filter */
  value: string;
}

const CHIP_COLOURS = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "error",
  neutral: "default",
} as const;

function ItemCard({
  item,
  active,
  onClick,
}: {
  item: CardItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <ListItem disablePadding sx={{ mb: 1 }}>
      <ListItemButton
        selected={active}
        aria-current={active || undefined}
        onClick={onClick}
        sx={{
          display: "block",
          border: "1px solid",
          borderColor: active ? "primary.main" : "divider",
          borderRadius: 1,
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
            {item.title}
          </Typography>
          {item.status && (
            <Chip
              size="small"
              label={item.status.label}
              color={CHIP_COLOURS[item.status.colour]}
            />
          )}
        </Box>
        {item.subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.subtitle}
          </Typography>
        )}
        {item.metadata?.map(({ key, label, value }) => (
          <Box
            key={key}
            sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="caption" noWrap>
              {value}
            </Typography>
          </Box>
        ))}
      </ListItemButton>
    </ListItem>
  );
}

/** Items to pick from, beside the workspace that shows the picked one */
export function ContextPanel({
  title,
  count,
  items,
  activeId,
  onActivate,
  search,
  onSearchChange,
  searchLabel = "Search",
  searchPlaceholder,
  filters = [],
  onFilterChange,
  onClearFilters,
  loading = false,
  error,
  emptyMessage = "Nothing yet",
  footer,
}: {
  title: string;
  /** How many items match, out of how many there are */
  count?: { matching: number; total: number };
  items: CardItem[];
  activeId?: string;
  onActivate?: (id: string) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  filters?: PanelFilter[];
  onFilterChange?: (key: string, value: string) => void;
  /** Shown when the search or filters hide every item */
  onClearFilters?: () => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  /** e.g. page controls, below the items */
  footer?: ReactNode;
}) {
  const filtered = !!search || filters.some((filter) => filter.value);

  return (
    <Box
      component="aside"
      aria-label={title}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 340,
        flexShrink: 0,
        minHeight: 0,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{ p: 2, pb: 1, display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
            {title}
          </Typography>
          {count && (
            <Typography
              variant="caption"
              color="text.secondary"
              aria-live="polite"
            >
              {count.matching === count.total
                ? count.total.toLocaleString()
                : `${count.matching.toLocaleString()} of ${count.total.toLocaleString()}`}
            </Typography>
          )}
        </Box>
        {onSearchChange && (
          <TextField
            fullWidth
            size="small"
            type="search"
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        {filters.length > 0 && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {filters.map((filter) => (
              <TextField
                key={filter.key}
                select
                fullWidth
                size="small"
                label={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2 }}>
        {error && (
          <Typography variant="body2" color="error.main" sx={{ py: 1 }}>
            {error}
          </Typography>
        )}
        {loading &&
          [0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ mb: 1 }} />
          ))}
        {!loading && !error && items.length === 0 && (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filtered ? "Nothing matches" : emptyMessage}
            </Typography>
            {filtered && onClearFilters && (
              <Button size="small" onClick={onClearFilters} sx={{ px: 0 }}>
                Clear filters
              </Button>
            )}
          </Box>
        )}
        {!loading && (
          <List disablePadding>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                active={item.id === activeId}
                onClick={onActivate && (() => onActivate(item.id))}
              />
            ))}
          </List>
        )}
      </Box>

      {footer && <Box sx={{ px: 2, py: 1 }}>{footer}</Box>}
    </Box>
  );
}
