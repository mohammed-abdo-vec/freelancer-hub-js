import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useNavigate } from 'react-router';
import { paths } from '@/shared/config/paths';
import { useSideNav } from '@/shared/layout';

// TODO(Phase 3): read the signed-in user from the auth store
const user = { name: 'Ada Lovelace', email: 'ada@example.com' };

const themeOptions = [
  { value: 'light', label: 'Light', icon: LightModeRoundedIcon },
  { value: 'dark', label: 'Dark', icon: DarkModeRoundedIcon },
  { value: 'system', label: 'System', icon: SettingsBrightnessRoundedIcon },
] as const;

/** Avatar button + account menu, rendered in the sidebar's footer slot. */
export function UserMenu() {
  const { collapsed, onNavigate } = useSideNav();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const close = () => setAnchorEl(null);
  const goTo = (to: string) => {
    close();
    onNavigate?.();
    navigate(to);
  };

  return (
    <Box sx={{ p: 1 }}>
      <ListItemButton
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ borderRadius: 2, gap: 1.5, px: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          {initials}
        </Avatar>
        {!collapsed && (
          <ListItemText
            primary={user.name}
            secondary={user.email}
            slotProps={{
              primary: { variant: 'body2', noWrap: true },
              secondary: { variant: 'caption', noWrap: true },
            }}
          />
        )}
      </ListItemButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: collapsed ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 232 } } }}
      >
        <MenuItem onClick={() => goTo(paths.settings)}>
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>Theme</ListSubheader>
        {themeOptions.map((option) => (
          <MenuItem key={option.value} selected={mode === option.value} onClick={() => setMode(option.value)}>
            <ListItemIcon>
              <option.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
            {mode === option.value && <CheckRoundedIcon fontSize="small" sx={{ ml: 2 }} />}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => goTo(paths.login)}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
