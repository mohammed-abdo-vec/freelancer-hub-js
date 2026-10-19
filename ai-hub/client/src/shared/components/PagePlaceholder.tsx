import type { SvgIconComponent } from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

type Props = {
  title: string;
  description: string;
  icon: SvgIconComponent;
};

/** Temporary body for pages that will be built in later phases. */
export function PagePlaceholder({ title, description, icon: Icon }: Props) {
  useDocumentTitle(title);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Icon sx={{ fontSize: 48, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
        <Chip label="Coming soon" size="small" variant="outlined" />
      </Stack>
    </Container>
  );
}
