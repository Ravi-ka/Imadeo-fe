'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/store/useAuthStore';
import { ReactQueryProvider } from '@/services/queryClient';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    // Sync UI store theme on mount
    const savedTheme = localStorage.getItem('imadeo_theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    
    setTheme(activeTheme);
  }, [setTheme]);

  return (
    <html lang="en" className={theme}>
      <head>
        <title>Imadeo - Process, Optimize & Manage Your Media at Scale</title>
        <meta name="description" content="Imadeo is a high-performance media processing platform. Upload, optimize, watermark, share, and transcode your images and videos seamlessly." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen relative overflow-x-hidden antialiased">
        <ReactQueryProvider>
          <div className="bg-grid-glow" />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
