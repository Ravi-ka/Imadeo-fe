'use client';

import { ComingSoonPage } from '@/components/dam/ComingSoonPage';

export default function IntegrationsPage() {
  return (
    <ComingSoonPage
      title="Integrations"
      breadcrumbs={['Home', 'Integrations']}
      description="Third-party connections for Drive, Slack, Figma, and more will be enabled in a later release."
    />
  );
}
