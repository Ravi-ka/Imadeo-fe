'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/dam/Header';
import { FileImage, Database, Zap, Plus, Upload, FolderOpen, Activity, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useUploadStore } from '@/store/useUploadStore';

export default function OverviewPage() {
  const { user, isLoaded } = useUser();
  const userName = isLoaded && user ? (user.firstName || user.username || 'User') : 'User';
  
  const { openUpload } = useUploadStore();

  return (
    <>
      <Header
        title="Account Overview"
        breadcrumbs={['Home', 'Overview']}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenUpload={openUpload}
        totalAssetsCount={0} // Hide count in header for overview
        isViewer={false}
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
            <p className="text-slate-500 mt-1">Here's what's happening in your Imadeo workspace today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openUpload}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Assets
            </button>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Create Folder
            </button>
          </div>
        </div>

        {/* High-level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileImage className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">1,482</h3>
              <p className="text-sm text-slate-500 font-medium">Total Assets</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">1.2 GB</h3>
              <p className="text-sm text-slate-500 font-medium">Storage Used</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden mt-3">
                <div className="bg-emerald-500 h-full rounded-full w-[24%]"></div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">5 GB</h3>
              <p className="text-sm text-slate-500 font-medium">Storage Limit</p>
              <p className="text-xs text-slate-400 mt-1">3.8 GB remaining</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">3</h3>
              <p className="text-sm text-slate-500 font-medium">Active Integrations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Recent Activity</h3>
              <button className="text-xs text-primary font-medium hover:underline">View all</button>
            </div>
            
            <div className="space-y-6 flex-1">
              {[
                { text: "You uploaded 12 files to Product Photography", time: "10 mins ago", icon: <Upload className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-500/10" },
                { text: "Brand Assets folder was shared with Sarah", time: "2 hours ago", icon: <FolderOpen className="w-4 h-4 text-blue-500" />, bg: "bg-blue-500/10" },
                { text: "Logo_Final.png was added to Favorites", time: "5 hours ago", icon: <FileImage className="w-4 h-4 text-amber-500" />, bg: "bg-amber-500/10" },
                { text: "You downloaded Q3_Report.pdf", time: "1 day ago", icon: <Database className="w-4 h-4 text-purple-500" />, bg: "bg-purple-500/10" }
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Accessed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Recently Accessed</h3>
              <Link href="/dashboard/media-assets" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Browse Media Assets <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary/50 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-950">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
                    <img src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop&sig=${i}`} alt="mock" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate">Campaign_Asset_{i}.jpg</p>
                    <p className="text-xs text-slate-500 mt-0.5">2.4 MB • Image</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
