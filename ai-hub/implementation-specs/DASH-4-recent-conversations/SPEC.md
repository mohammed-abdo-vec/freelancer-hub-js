# DASH-4 · Jump back into recent conversations: implementation spec

> **Story card:** [stories/DASH-4-recent-conversations.md](../../stories/DASH-4-recent-conversations.md) · **Depends on:** DASH-1, CHAT-7 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/home/components/RecentConversations.tsx` | uses `useConversations('')` from `@/features/chat` |
| modify | `src/features/home/pages/DashboardPage.tsx` | add the card |

## Steps
1. "Most recent" means sorting by `updatedAt` descending and ignoring pinned (the API returns pinned first), then take 5. Sort a copy; never mutate the query data.
2. Each row is a `ListItemButton component={RouterLink} to={paths.conversation(id)}` with a `ProviderAvatar`, the title, `lastMessagePreview` (1 line, `text.secondary`) and a `RelativeTime`.
3. Card header: "Recent conversations" plus a "Start new chat" button (`EditSquare` icon) to `paths.chat`.
4. It shares the `['conversations', { search: '' }]` cache with the sidebar, so there's no extra request.

## Acceptance criteria
- [ ] Shows at most 5, newest first, and clicking one opens it.
- [ ] "Start new chat" goes to `/chat`.
- [ ] An empty state on a fresh account.

## Verify
After seeding and a couple of chats, check the order against the sidebar's Recents.

## Out of scope
- Onboarding (DASH-5).
