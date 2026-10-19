import type { SvgIconComponent } from '@mui/icons-material';

export type NavItemConfig = {
  label: string;
  to: string;
  icon: SvgIconComponent;
  shortcut?: string;
  /** Fetch the page's chunk early (on hover/focus). */
  preload?: () => void;
};
