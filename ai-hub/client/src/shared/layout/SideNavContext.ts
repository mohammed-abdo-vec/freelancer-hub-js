import { createContext, useContext } from 'react';

export type SideNavState = {
  /** The desktop sidebar is shrunk to an icon rail. */
  collapsed: boolean;
  /** Call after navigating; closes the drawer on mobile. */
  onNavigate?: () => void;
};

export const SideNavContext = createContext<SideNavState>({ collapsed: false });

/** For components that features plug into the sidebar (chat history, user menu). */
export function useSideNav() {
  return useContext(SideNavContext);
}
