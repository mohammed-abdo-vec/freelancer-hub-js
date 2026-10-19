import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

type Props = { title: string; children: ReactNode };

/** Centered card without the app shell, used by the sign-in and sign-up pages. */
export function AuthLayout({ title, children }: Props) {
  useDocumentTitle(title);

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <AutoAwesomeRoundedIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
          </Stack>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
