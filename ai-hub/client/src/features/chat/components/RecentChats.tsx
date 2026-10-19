import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { NavLink } from 'react-router';
import { paths } from '@/shared/config/paths';
import { useSideNav } from '@/shared/layout';
import { mockConversations } from '../data/mockConversations';
import { ChatPage } from '../routes';

/** Chat history, rendered in the sidebar's content slot. */
export function RecentChats() {
  const { onNavigate } = useSideNav();
  const sections = [
    { title: 'Pinned', items: mockConversations.filter((c) => c.pinned) },
    { title: 'Recents', items: mockConversations.filter((c) => !c.pinned) },
  ].filter((section) => section.items.length > 0);

  return (
    <Box component="nav" aria-label="Chat history" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 1 }}>
      {sections.map((section) => (
        <List
          key={section.title}
          dense
          disablePadding
          subheader={
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px', px: 1.5 }}>
              {section.title}
            </ListSubheader>
          }
        >
          {section.items.map((conversation) => (
            <ListItemButton
              key={conversation.id}
              component={NavLink}
              to={paths.conversation(conversation.id)}
              onClick={onNavigate}
              onMouseEnter={ChatPage.preload}
              sx={{ borderRadius: 2, px: 1.5, '&.active': { bgcolor: 'action.selected' } }}
            >
              <ListItemText
                primary={conversation.title}
                slotProps={{ primary: { variant: 'body2', noWrap: true } }}
              />
            </ListItemButton>
          ))}
        </List>
      ))}
    </Box>
  );
}
