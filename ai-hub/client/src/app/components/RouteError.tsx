import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { isRouteErrorResponse, useRouteError } from 'react-router';

/**
 * Error boundary for routes. The usual cause in production is a stale chunk after a
 * deploy ("Failed to fetch dynamically imported module"), which a reload fixes.
 */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '60dvh', p: 3 }}>
      <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="h5" component="h1">
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480, wordBreak: 'break-word' }}>
        {message}
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </Stack>
  );
}
