const storageKey = (instrument: string) => `instrument-session:${instrument}`;

/** The session last chosen on this instrument, if storage is available */
export function loadStoredSession(instrument: string): string | null {
  try {
    return localStorage.getItem(storageKey(instrument));
  } catch {
    return null;
  }
}

export function storeSession(instrument: string, session: string) {
  try {
    localStorage.setItem(storageKey(instrument), session);
  } catch (error) {
    console.warn("Failed to save instrument session to localStorage:", error);
  }
}

/**
 * The session to use: the stored choice if it is still available, otherwise
 * the only available session. With several sessions and no valid stored
 * choice, the user has to pick one.
 */
export function resolveSession(
  stored: string | null,
  sessions: string[] | null,
): string | null {
  if (!sessions) return null;
  if (stored && sessions.includes(stored)) return stored;
  return sessions.length === 1 ? sessions[0] : null;
}
