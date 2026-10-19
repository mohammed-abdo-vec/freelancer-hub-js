import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import { PagePlaceholder } from '@/shared/components/PagePlaceholder';

export function ComparePage() {
  return (
    <PagePlaceholder
      title="Compare models"
      icon={CompareArrowsRoundedIcon}
      description="Send one prompt to up to four models and read the answers side by side."
    />
  );
}
