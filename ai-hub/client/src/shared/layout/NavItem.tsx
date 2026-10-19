import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router';
import type { NavItemConfig } from './types';

type Props = {
  item: NavItemConfig;
  collapsed: boolean;
  onNavigate?: () => void;
};

export function NavItem({ item, collapsed, onNavigate }: Props) {
  const { label, to, icon: Icon, shortcut, preload } = item;

  return (
    // The rail hides labels, so the tooltip becomes the label
    <Tooltip title={collapsed ? label : ''} placement="right">
      <ListItemButton
        component={NavLink}
        to={to}
        end
        aria-label={collapsed ? label : undefined}
        onClick={onNavigate}
        onMouseEnter={preload}
        onFocus={preload}
        sx={{
          minHeight: 40,
          px: 1.5,
          borderRadius: 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
          '&.active': { bgcolor: 'action.selected' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: 'text.primary' }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        {!collapsed && (
          <>
            <ListItemText primary={label} slotProps={{ primary: { variant: 'body2', noWrap: true } }} />
            {shortcut && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {shortcut}
              </Typography>
            )}
          </>
        )}
      </ListItemButton>
    </Tooltip>
  );
}
