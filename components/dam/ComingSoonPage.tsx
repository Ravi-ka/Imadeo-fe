'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Header } from '@/components/dam/Header';
import { Button } from '@/components/ui/Button';

interface ComingSoonPageProps {
  title: string;
  breadcrumbs: string[];
  description: string;
}

export function ComingSoonPage({ title, breadcrumbs, description }: ComingSoonPageProps) {
  return (
    <>
      <Header
        title={title}
        breadcrumbs={breadcrumbs}
        searchQuery=""
        onSearchChange={() => {}}
        totalAssetsCount={0}
        isViewer={false}
      />

      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-4">
            Coming Soon
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
          <p className="text-slate-500 max-w-md mb-8">{description}</p>
          <Link href="/dashboard/media-assets">
            <Button>Go to Media Assets</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
