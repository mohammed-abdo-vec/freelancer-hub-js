import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import { PagePlaceholder } from '@/shared/components/PagePlaceholder';

export function DashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      icon={SpaceDashboardRoundedIcon}
      description="Your requests, token usage and recent conversations at a glance."
    />
  );
}
