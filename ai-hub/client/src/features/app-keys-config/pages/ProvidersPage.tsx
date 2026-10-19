import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { PagePlaceholder } from '@/shared/components/PagePlaceholder';

export function ProvidersPage() {
  return (
    <PagePlaceholder
      title="Providers"
      icon={KeyRoundedIcon}
      description="Connect OpenAI, Anthropic, Gemini and more with your own API keys."
    />
  );
}
