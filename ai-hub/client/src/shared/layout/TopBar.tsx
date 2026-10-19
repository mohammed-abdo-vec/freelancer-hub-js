import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/shared/config/paths';

type Props = { onOpenNav: () => void };

/** Mobile-only header: hamburger, title, and a new-chat shortcut (like the ChatGPT/Claude apps). */
export function TopBar({ onOpenNav }: Props) {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Tooltip title="Open menu">
          <IconButton edge="start" aria-label="Open menu" onClick={onOpenNav}>
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="subtitle1" component="span" sx={{ flex: 1, fontWeight: 600 }}>
          AI Hub
        </Typography>
        <Tooltip title="New chat">
          <IconButton edge="end" aria-label="New chat" component={RouterLink} to={paths.chat}>
            <EditSquareIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
