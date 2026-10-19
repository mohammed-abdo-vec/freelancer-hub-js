import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/routes/paths';
import { NavItem } from './NavItem';
import { navItems } from './navItems';
import { RecentChats } from './RecentChats';
import { UserMenu } from './UserMenu';

type Props = {
  /** Icon-only rail (desktop). */
  collapsed?: boolean;
  onToggle: () => void;
  /** Called after any navigation, used to close the mobile drawer. */
  onNavigate?: () => void;
};

export function SideNav({ collapsed = false, onToggle, onNavigate }: Props) {
  const toggleLabel = collapsed ? 'Open sidebar' : 'Close sidebar';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 56,
          px: 1.5,
        }}
      >
        {!collapsed && (
          <Box
            component={RouterLink}
            to={paths.dashboard}
            onClick={onNavigate}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', textDecoration: 'none', px: 0.5 }}
          >
            <AutoAwesomeRoundedIcon color="primary" />
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
              AI Hub
            </Typography>
          </Box>
        )}
        <Tooltip title={toggleLabel} placement="right">
          <IconButton aria-label={toggleLabel} onClick={onToggle}>
            <ViewSidebarRoundedIcon sx={{ transform: 'scaleX(-1)' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <List component="nav" aria-label="Main" sx={{ px: 1, display: 'grid', gap: 0.25 }}>
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </List>

      {collapsed ? <Box sx={{ flex: 1 }} /> : <RecentChats onNavigate={onNavigate} />}

      <Divider />
      <UserMenu collapsed={collapsed} onNavigate={onNavigate} />
    </Box>
  );
}
