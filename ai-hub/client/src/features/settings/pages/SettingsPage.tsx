import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { PagePlaceholder } from '@/shared/components/PagePlaceholder';

export function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      icon={SettingsRoundedIcon}
      description="Profile, appearance and chat defaults."
    />
  );
}
