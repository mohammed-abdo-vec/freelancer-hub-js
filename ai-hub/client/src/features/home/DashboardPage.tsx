import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function DashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      icon={SpaceDashboardRoundedIcon}
      description="Your requests, token usage and recent conversations at a glance."
    />
  );
}
