import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { getErrorMessage, getErrorStatus, getFieldErrors } from '@/shared/api/errors';
import { paths } from '@/shared/config/paths';
import { useRegister } from '../../hooks/useRegister';
import { PasswordField } from '../PasswordField';
import { registerFormSchema, type RegisterFormSchema } from './config';

const formFields = ['name', 'email', 'password', 'confirmPassword'] as const;
const isFormField = (key: string): key is (typeof formFields)[number] =>
  (formFields as readonly string[]).includes(key);

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(({ name, email, password }) => {
    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => navigate(paths.dashboard, { replace: true }),
        onError: (err) => {
          const status = getErrorStatus(err);
          if (status === 409) {
            setError('email', { message: 'An account with this email already exists' });
          } else if (status === 400) {
            for (const [field, message] of Object.entries(getFieldErrors(err))) {
              if (isFormField(field)) setError(field, { message });
            }
          }
        },
      },
    );
  });

  // 409/400 land on the fields; anything else (network, 500…) gets a banner
  const status = getErrorStatus(registerMutation.error);
  const showAlert = registerMutation.isError && status !== 409 && status !== 400;
  const isPending = registerMutation.isPending;

  return (
    <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
      {showAlert && <Alert severity="error">{getErrorMessage(registerMutation.error)}</Alert>}
      <TextField
        {...register('name')}
        label="Name"
        autoComplete="name"
        autoFocus
        fullWidth
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <TextField
        {...register('email')}
        label="Email"
        type="email"
        autoComplete="email"
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />
      <PasswordField
        {...register('password')}
        label="Password"
        autoComplete="new-password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <PasswordField
        {...register('confirmPassword')}
        label="Confirm password"
        autoComplete="new-password"
        fullWidth
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
      >
        Create account
      </Button>
    </Stack>
  );
}
