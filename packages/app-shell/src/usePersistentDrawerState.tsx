import { useState } from "react";

export const DRAWER_STATE_KEY = "drawer_state";

export function usePersistentDrawerState() {
  const [sidebarOpen, setSidebarOpenState] = useState<boolean>(() => {
    const cachedState = localStorage.getItem(DRAWER_STATE_KEY);
    return cachedState ? JSON.parse(cachedState) : true;
  });

  const setSidebarOpen = (open: boolean) => {
    localStorage.setItem(DRAWER_STATE_KEY, JSON.stringify(open));
    setSidebarOpenState(open);
  };

  return { sidebarOpen, setSidebarOpen };
}
