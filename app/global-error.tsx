'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-950 text-white">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-slate-400 max-w-md">
          The application hit an unexpected error. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
