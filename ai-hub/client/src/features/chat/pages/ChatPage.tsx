import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Composer } from '../components/Composer';
import { mockConversations } from '../data/mockConversations';

export function ChatPage() {
  const { conversationId } = useParams();
  const conversation = mockConversations.find((c) => c.id === conversationId);
  useDocumentTitle(conversation?.title ?? 'New chat');

  // New chat: greeting and composer sit together in the middle, like ChatGPT/Claude/Gemini
  if (!conversationId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 3 }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center', px: 2 }}>
          What can I help with?
        </Typography>
        <Composer />
      </Box>
    );
  }

  // Existing conversation: scrolling thread on top, composer pinned to the bottom
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        component="header"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: { xs: 'none', md: 'block' } }}
      >
        <Typography variant="subtitle1" component="h1" noWrap sx={{ fontWeight: 600 }}>
          {conversation?.title ?? 'Conversation'}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', placeItems: 'center', px: 2 }}>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          {conversation ? 'Messages will appear here.' : 'This conversation does not exist.'}
        </Typography>
      </Box>
      <Composer />
    </Box>
  );
}
