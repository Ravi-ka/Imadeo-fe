'use client';

import { Button } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
      <p className="mt-2 text-slate-500 max-w-md">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Button onClick={() => { window.location.href = '/dashboard'; }}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
