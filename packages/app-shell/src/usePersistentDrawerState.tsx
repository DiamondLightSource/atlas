import { useState } from "react";

export const DRAWER_STATE_KEY = "drawer_state";

export function usePersistentDrawerState() {
  const [open, setOpenState] = useState<boolean>(() => {
    const cachedState = localStorage.getItem(DRAWER_STATE_KEY);
    return cachedState ? JSON.parse(cachedState) : true;
  });

  const setOpen = (open: boolean) => {
    localStorage.setItem(DRAWER_STATE_KEY, JSON.stringify(open));
    setOpenState(open);
  };

  return { open, setOpen };
}
