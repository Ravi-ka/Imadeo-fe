'use client';

import { ComingSoonPage } from '@/components/dam/ComingSoonPage';

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      breadcrumbs={['Home', 'Settings']}
      description="Workspace configuration, billing, and notification preferences are coming soon. Use the profile menu to manage your Clerk account."
    />
  );
}
