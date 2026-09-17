'use client';

import { ComingSoonPage } from '@/components/dam/ComingSoonPage';

export default function OverviewPage() {
  return (
    <ComingSoonPage
      title="Overview"
      breadcrumbs={['Home', 'Overview']}
      description="Workspace summaries, recent activity, and storage insights will appear here in a future release."
    />
  );
}
