import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/routes/paths';
import { AuthLayout } from './AuthLayout';

// TODO(Phase 3): name + email + password form
export function RegisterPage() {
  return (
    <AuthLayout title="Create your account">
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        Sign-up arrives with the auth phase. For now, jump straight into the app.
      </Typography>
      <Button variant="contained" size="large" component={RouterLink} to={paths.dashboard}>
        Continue
      </Button>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to={paths.login}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
