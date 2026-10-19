import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { paths } from '@/shared/config/paths';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <Stack
      spacing={2}
      sx={{ minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, bgcolor: 'background.default' }}
    >
      <Typography variant="h2" component="p" color="primary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h5" component="h1">
        This page doesn't exist
      </Typography>
      <Typography color="text.secondary">The link may be broken, or the page may have moved.</Typography>
      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" component={RouterLink} to={paths.chat}>
          New chat
        </Button>
        <Button variant="outlined" component={RouterLink} to={paths.dashboard}>
          Dashboard
        </Button>
      </Stack>
    </Stack>
  );
}
