import { renderHook } from "@atlas/vitest-conf";
import {
  DRAWER_STATE_KEY,
  usePersistentDrawerState,
} from "./usePersistentDrawerState";
import { act } from "react";

describe("usePersistentDrawerState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to open when no localStorage exists", () => {
    const { result } = renderHook(() => usePersistentDrawerState());
    expect(result.current.open).toBe(true);
  });

  it("reads state from localStorage", () => {
    localStorage.setItem(DRAWER_STATE_KEY, false.toString());

    const { result } = renderHook(() => usePersistentDrawerState());
    expect(result.current.open).toBe(false);
  });

  it("writes state to localStorage", () => {
    const { result } = renderHook(() => usePersistentDrawerState());

    expect(result.current.open).toBe(true); // default;
    act(() => result.current.setOpen(false));
    const cached = JSON.parse(localStorage.getItem(DRAWER_STATE_KEY)!);
    expect(cached).toBe(false);
  });
});
