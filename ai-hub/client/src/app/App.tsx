import { RouterProvider } from 'react-router';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { router } from './router';

function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}

export default App;
