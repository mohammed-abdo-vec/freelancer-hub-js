import { Suspense, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet, useNavigate } from 'react-router';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { paths } from '@/shared/config/paths';
import { SideNav, type SideNavSlots } from './SideNav';
import { TopBar } from './TopBar';

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 68;

/**
 * Sidebar + content layout. It knows nothing about features: the app passes in the
 * nav items and what to render in the sidebar's content/footer slots.
 */
export function AppShell(slots: SideNavSlots) {
  const theme = useTheme();
  // noSsr: read the real value on first render so desktop never flashes the mobile layout
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [collapsed, setCollapsed] = useLocalStorageState('ai-hub-sidebar-collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Ctrl/Cmd+K starts a new chat from anywhere
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileOpen(false);
        navigate(paths.chat);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const width = collapsed ? RAIL_WIDTH : DRAWER_WIDTH;
  const widthTransition = theme.transitions.create('width', {
    duration: theme.transitions.duration.shorter,
  });

  return (
    <Box sx={{ display: 'flex', height: '100dvh', bgcolor: 'background.default' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width,
            flexShrink: 0,
            transition: widthTransition,
            '& .MuiDrawer-paper': { width, overflowX: 'hidden', transition: widthTransition },
          }}
        >
          <SideNav {...slots} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, maxWidth: '85vw' } }}
        >
          <SideNav {...slots} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!isDesktop && <TopBar onOpenNav={() => setMobileOpen(true)} />}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
          {/* Shown only on a page's first load; later navigations keep the old page until the chunk is ready */}
          <Suspense fallback={<LinearProgress sx={{ position: 'absolute', inset: '0 0 auto 0' }} />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
