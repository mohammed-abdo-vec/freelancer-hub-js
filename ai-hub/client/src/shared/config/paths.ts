export const paths = {
  dashboard: '/',
  chat: '/chat',
  conversation: (id: string) => `/chat/${id}`,
  compare: '/compare',
  providers: '/providers',
  settings: '/settings',
  login: '/login',
  register: '/register',
} as const;
