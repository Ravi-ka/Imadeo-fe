'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dam/Header';
import { Settings as SettingsIcon, Shield, Bell, User, Key, Database, CreditCard } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getImadeoIdApi } from '@/services/imadeoService';

export default function SettingsPage() {
  const { getToken, isLoaded } = useAuth();
  const [imadeoId, setImadeoId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchId = async () => {
      if (!isLoaded) return;
      try {
        const token = await getToken({ skipCache: true });
        const fetchedId = await getImadeoIdApi(token);
        if (isMounted && fetchedId) {
          setImadeoId(fetchedId);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchId();
    return () => { isMounted = false; };
  }, [getToken, isLoaded]);

  return (
    <>
      <Header
        title="Settings"
        breadcrumbs={['Home', 'Settings']}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenUpload={() => {}}
        totalAssetsCount={0}
        isViewer={false}
      />

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Settings Sidebar Navigation (Mock) */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {[
              { label: 'General', icon: <SettingsIcon className="w-4 h-4" />, active: true },
              { label: 'Profile', icon: <User className="w-4 h-4" /> },
              { label: 'Security & Access', icon: <Shield className="w-4 h-4" /> },
              { label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { label: 'API Keys', icon: <Key className="w-4 h-4" /> },
              { label: 'Storage & Plan', icon: <Database className="w-4 h-4" /> },
              { label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
            ].map(item => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-sm">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-primary" /> Workspace Configuration
                </h2>
                <p className="text-sm text-slate-500">Manage your core DAM workspace settings and preferences.</p>
              </div>

              <div className="space-y-6">
                
                {/* Imadeo Handle */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Permanent Imadeo Handle</h4>
                      <p className="text-xs text-slate-500 mt-1">This handle is used to identify your workspace in sharing links and API calls.</p>
                    </div>
                    <span className="inline-block px-2.5 py-1 rounded bg-primary/10 text-primary font-semibold text-xs tracking-wide uppercase">Permanent</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-sm flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2">
                      <span className="text-slate-400 mr-1">@</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white truncate">
                        {imadeoId || 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workspace Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white">Workspace Name</label>
                  <input 
                    type="text" 
                    defaultValue="My Default Workspace"
                    className="block w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  <p className="text-xs text-slate-500">The human-readable name of your current DAM workspace.</p>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white">Default Timezone</label>
                  <select 
                    className="block w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>CET (Central European Time)</option>
                  </select>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors">
                  Save Changes
                </button>
              </div>

            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl p-8">
              <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                Irreversible actions that affect your workspace data and access.
              </p>
              <button className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 font-semibold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Delete Workspace
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
