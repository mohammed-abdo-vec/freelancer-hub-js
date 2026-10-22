import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { RouterProvider } from 'react-router';
import { queryClient } from '@/shared/api/queryClient';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { router } from './router';

function App() {
  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={4000}
        >
          <RouterProvider router={router} />
        </SnackbarProvider>
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </AppThemeProvider>
  );
}

export default App;
