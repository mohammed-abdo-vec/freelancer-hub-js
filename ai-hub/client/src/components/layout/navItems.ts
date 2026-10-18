import type { SvgIconComponent } from '@mui/icons-material';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import * as pages from '@/routes/pages';
import { paths } from '@/routes/paths';

export type NavItemConfig = {
  label: string;
  to: string;
  icon: SvgIconComponent;
  shortcut?: string;
  preload: () => void;
};

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
export const newChatShortcut = isMac ? '⌘K' : 'Ctrl K';

export const navItems: NavItemConfig[] = [
  {
    label: 'New chat',
    to: paths.chat,
    icon: EditSquareIcon,
    shortcut: newChatShortcut,
    preload: pages.ChatPage.preload,
  },
  {
    label: 'Dashboard',
    to: paths.dashboard,
    icon: SpaceDashboardRoundedIcon,
    preload: pages.DashboardPage.preload,
  },
  {
    label: 'Compare models',
    to: paths.compare,
    icon: CompareArrowsRoundedIcon,
    preload: pages.ComparePage.preload,
  },
  {
    label: 'Providers',
    to: paths.providers,
    icon: KeyRoundedIcon,
    preload: pages.ProvidersPage.preload,
  },
];
