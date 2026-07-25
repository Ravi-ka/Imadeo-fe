'use client';

import React from 'react';
import { Layers, HardDrive, Share2, UploadCloud, TrendingUp, Sparkles } from 'lucide-react';
import { DAMStat } from './types';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
  stats: DAMStat[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-5 h-5 text-primary-light" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-secondary-light" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-amber-400" />;
      case 'UploadCloud': return <UploadCloud className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-accent-light" />;
    }
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="relative group p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden"
        >
          {/* Subtle hover gradient accent overlay */}
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gradient-to-tr opacity-10 group-hover:opacity-20 transition-opacity blur-xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
            </div>

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 flex items-center justify-center shadow-sm`}>
              <div className="w-full h-full bg-slate-900/40 rounded-[10px] flex items-center justify-center">
                {getIcon(stat.icon)}
              </div>
            </div>
          </div>

          {/* Storage usage bar or growth trend indicator */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
            {stat.label === 'Storage Used' ? (
              <div className="w-full space-y-1">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[64.2%]" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>64.2 GB used</span>
                  <span>100 GB limit</span>
                </div>
              </div>
            ) : (
              <>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.change}
                </span>
                <span className="text-slate-400 text-[11px]">Updated live</span>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </section>
  );
}
