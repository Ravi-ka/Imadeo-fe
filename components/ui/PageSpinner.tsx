import { Loader2 } from 'lucide-react';

export function PageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center space-x-2 text-sm text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
