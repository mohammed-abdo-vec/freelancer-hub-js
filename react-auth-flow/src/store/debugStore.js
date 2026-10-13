// A tiny second store just for the classroom debug panel: a log of what the
// HTTP layer is doing (requests, 401s, refreshes, retries). Not needed in a real app.
import { create } from 'zustand';

export const useDebugLog = create((set) => ({
  entries: [],
  log: (kind, text) =>
    set((s) => ({
      entries: [{ id: crypto.randomUUID(), at: new Date(), kind, text }, ...s.entries].slice(0, 30),
    })),
  clear: () => set({ entries: [] }),
}));

// Callable from plain JS (outside components) — every Zustand store has getState().
export const debugLog = (kind, text) => useDebugLog.getState().log(kind, text);
