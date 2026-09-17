import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background-light dark:bg-background-dark">
      <Logo href="/" showWordmark size="lg" />
      <h1 className="mt-8 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
