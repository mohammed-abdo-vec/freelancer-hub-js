import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingScreen() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100dvh', bgcolor: 'background.default' }}>
      <CircularProgress aria-label="Loading" />
    </Box>
  );
}
