import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from '../components/AuthLayout';

// TODO(Phase 3): email + password form
export function LoginPage() {
  return (
    <AuthLayout title="Welcome back">
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        Sign-in arrives with the auth phase. For now, jump straight into the app.
      </Typography>
      <Button variant="contained" size="large" component={RouterLink} to={paths.dashboard}>
        Continue
      </Button>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        No account?{' '}
        <Link component={RouterLink} to={paths.register}>
          Sign up
        </Link>
      </Typography>
    </AuthLayout>
  );
}
