// Placeholder history for the sidebar until the conversations API is wired up (SPEC Phase 5)
export type ConversationSummary = {
  id: string;
  title: string;
  pinned?: boolean;
};

export const mockConversations: ConversationSummary[] = [
  { id: 'welcome', title: 'Welcome to AI Hub', pinned: true },
  { id: 'trip-plan', title: 'Weekend trip plan to Lisbon' },
  { id: 'sql-help', title: 'Optimizing a slow SQL join' },
  { id: 'react-hooks', title: 'When to use useMemo vs useCallback' },
  { id: 'cover-letter', title: 'Cover letter for a frontend role' },
  { id: 'regex', title: 'Regex for validating emails' },
  { id: 'gpt-vs-claude', title: 'Comparing model answers on recursion' },
];
