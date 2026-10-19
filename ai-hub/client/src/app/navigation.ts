import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import { ProvidersPage } from '@/features/app-keys-config';
import { ChatPage } from '@/features/chat';
import { ComparePage } from '@/features/compare';
import { DashboardPage } from '@/features/home';
import { paths } from '@/shared/config/paths';
import type { NavItemConfig } from '@/shared/layout';

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

/** Main sidebar links. Hovering one preloads that feature's page chunk. */
export const navItems: NavItemConfig[] = [
  {
    label: 'New chat',
    to: paths.chat,
    icon: EditSquareIcon,
    shortcut: isMac ? '⌘K' : 'Ctrl K',
    preload: ChatPage.preload,
  },
  { label: 'Dashboard', to: paths.dashboard, icon: SpaceDashboardRoundedIcon, preload: DashboardPage.preload },
  { label: 'Compare models', to: paths.compare, icon: CompareArrowsRoundedIcon, preload: ComparePage.preload },
  { label: 'Providers', to: paths.providers, icon: KeyRoundedIcon, preload: ProvidersPage.preload },
];
