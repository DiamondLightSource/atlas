import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Slot = HTMLElement | null;

interface PageSlots {
  tabBarEnd: Slot;
  setTabBarEnd: (element: Slot) => void;
  sidePanel: Slot;
  setSidePanel: (element: Slot) => void;
}

const PageSlotsContext = createContext<PageSlots | null>(null);

/** Places in the layout, outside a page, that the page can render into */
export function PageSlotsProvider({ children }: { children: ReactNode }) {
  const [tabBarEnd, setTabBarEnd] = useState<Slot>(null);
  const [sidePanel, setSidePanel] = useState<Slot>(null);
  return (
    <PageSlotsContext.Provider
      value={{ tabBarEnd, setTabBarEnd, sidePanel, setSidePanel }}
    >
      {children}
    </PageSlotsContext.Provider>
  );
}

export function usePageSlots(): PageSlots | null {
  return useContext(PageSlotsContext);
}

/** Renders its children at the right end of the section's tab bar */
export function TabBarActions({ children }: { children: ReactNode }) {
  const slot = usePageSlots()?.tabBarEnd;
  return slot ? createPortal(children, slot) : null;
}

/**
 * Renders its children in a column at the right of the page, below the tab
 * bar, flush with the edges rather than inside the page's padding
 */
export function PageSidePanel({ children }: { children: ReactNode }) {
  const slot = usePageSlots()?.sidePanel;
  return slot ? createPortal(children, slot) : null;
}
