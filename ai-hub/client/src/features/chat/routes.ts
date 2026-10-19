import type { RouteObject } from 'react-router';
import { paths } from '@/shared/config/paths';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so the page ships in its own chunk; `.preload()` warms it up from nav links.
export const ChatPage = lazyPage(() => import('./pages/ChatPage'), (m) => m.ChatPage);

export const chatRoutes: RouteObject[] = [
  { path: paths.chat, Component: ChatPage },
  { path: `${paths.chat}/:conversationId`, Component: ChatPage },
];
