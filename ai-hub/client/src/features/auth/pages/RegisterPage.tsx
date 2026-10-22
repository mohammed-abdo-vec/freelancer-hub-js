import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  return (
    <AuthLayout title="Create your account">
      <RegisterForm />
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to={paths.login}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
