'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dam/Header';
import { Search, Zap, Info, Plus } from 'lucide-react';

const mockIntegrations = [
  { name: 'Google Drive', desc: 'Sync files automatically between Drive and Imadeo DAM.', category: 'Storage', icon: 'G' },
  { name: 'Dropbox', desc: 'Import and export media directly to your Dropbox account.', category: 'Storage', icon: 'D' },
  { name: 'Adobe Creative Cloud', desc: 'Access DAM assets directly within Photoshop, Illustrator, and Premiere.', category: 'Design', icon: 'CC' },
  { name: 'Figma', desc: 'Pull brand assets and images directly into your Figma canvas.', category: 'Design', icon: 'F' },
  { name: 'Slack', desc: 'Receive notifications when new assets are uploaded or shared.', category: 'Collaboration', icon: 'S' },
  { name: 'Microsoft Teams', desc: 'Share assets directly into Teams channels.', category: 'Collaboration', icon: 'T' },
  { name: 'Canva', desc: 'Use DAM assets directly in your Canva designs.', category: 'Marketing', icon: 'C' },
  { name: 'Zapier', desc: 'Connect Imadeo to 5,000+ apps and automate your workflows.', category: 'Automation', icon: 'Z' }
];

const categories = ['All', 'Storage', 'Design', 'Collaboration', 'Marketing', 'Automation'];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredIntegrations = mockIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header
        title="Integrations"
        breadcrumbs={['Home', 'Integrations']}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenUpload={() => {}}
        totalAssetsCount={0}
        isViewer={false}
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" /> Integrations
          </h1>
          <p className="text-slate-500 text-lg">
            Connect your DAM library with your team’s existing tools and workflows to supercharge your productivity.
          </p>
          
          <div className="mt-4 flex items-start gap-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 p-4 rounded-xl border border-blue-500/20">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Early Access Notice:</strong> The Integrations Marketplace is currently in preview. Active connections and authentication flows will be enabled in a future release.
            </p>
          </div>
        </div>

        {/* Connected Integrations */}
        <section>
          <h2 className="text-xl font-bold mb-4">Connected Integrations</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No integrations connected</h3>
            <p className="text-slate-500 text-sm">You haven't connected any third-party tools to your workspace yet.</p>
          </div>
        </section>

        {/* Marketplace */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold">Discover Apps</h2>
            
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === category 
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIntegrations.map(integration => (
              <div key={integration.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                    Preview
                  </span>
                </div>
                
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-105 transition-transform">
                    {integration.icon}
                  </div>
                  <div className="mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {integration.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{integration.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">{integration.desc}</p>
                </div>
                
                <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-400 font-medium py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                  <Plus className="w-4 h-4" /> Connect
                </button>
              </div>
            ))}
            {filteredIntegrations.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No integrations found matching your criteria.
              </div>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
