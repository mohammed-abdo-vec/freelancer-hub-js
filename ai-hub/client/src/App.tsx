import { RouterProvider } from 'react-router';
import { router } from '@/router';
import { AppThemeProvider } from '@/theme/AppThemeProvider';

function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}

export default App;
