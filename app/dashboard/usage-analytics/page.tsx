'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dam/Header';
import { Calendar, ChevronDown, PieChart, BarChart3, Download, Upload, HardDrive, FileImage, Folder } from 'lucide-react';

export default function UsageAnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <>
      <Header
        title="Usage & Analytics"
        breadcrumbs={['Home', 'Usage & Analytics']}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenUpload={() => {}}
        totalAssetsCount={0}
        isViewer={false}
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Calendar className="w-4 h-4 text-slate-500" />
              {dateRange}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
              {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Assets" value="1,482" change="+12%" icon={<FileImage />} color="text-primary" bg="bg-primary/10" />
          <MetricCard title="Storage Used" value="1.2 GB" change="+5%" icon={<HardDrive />} color="text-blue-500" bg="bg-blue-500/10" />
          <MetricCard title="Uploads" value="342" change="+24%" icon={<Upload />} color="text-emerald-500" bg="bg-emerald-500/10" />
          <MetricCard title="Downloads / Views" value="8,901" change="-2%" trend="down" icon={<Download />} color="text-purple-500" bg="bg-purple-500/10" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" /> Asset Growth Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
              {/* CSS Mock Chart */}
              {[40, 55, 45, 70, 65, 80, 95].map((h, i) => (
                <div key={i} className="w-full relative group flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-md relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                      {Math.floor((h/100)*300)} assets
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-center mt-2">Day {i*5+1}</span>
                </div>
              ))}
              {/* Overlay for mock label */}
              <div className="absolute top-0 right-4 bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded text-slate-500">Placeholder Data</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-slate-400" /> Asset Distribution</h3>
            <div className="h-48 flex items-center justify-center relative">
               {/* Pure CSS Donut Mock */}
               <div className="w-40 h-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 relative">
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-primary border-r-primary transform rotate-45"></div>
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-b-blue-500 transform rotate-12"></div>
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-emerald-500 transform -rotate-12"></div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold">1.4k</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                  </div>
               </div>
               <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded text-slate-500">Placeholder Data</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Images', value: '65%', color: 'bg-primary' },
                { label: 'Videos', value: '20%', color: 'bg-blue-500' },
                { label: 'Documents', value: '10%', color: 'bg-emerald-500' },
                { label: 'Other', value: '5%', color: 'bg-slate-200' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold mb-6">Top Folders by Size</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Folder Name</th>
                    <th className="px-4 py-3">Assets</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Marketing Q3 Campaign', count: 245, size: '850 MB' },
                    { name: 'Product Photography 2024', count: 512, size: '2.1 GB' },
                    { name: 'Brand Guidelines', count: 42, size: '120 MB' },
                    { name: 'Social Media Assets', count: 189, size: '430 MB' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> {row.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{row.count}</td>
                      <td className="px-4 py-3 text-right font-mono">{row.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold mb-6">Recent User Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Action</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { action: 'Upload', asset: 'hero-banner-v2.jpg', date: 'Oct 24, 2024' },
                    { action: 'Download', asset: 'brand_logo_final.svg', date: 'Oct 24, 2024' },
                    { action: 'Share', asset: 'Q3_Financial_Report.pdf', date: 'Oct 23, 2024' },
                    { action: 'Delete', asset: 'old_draft_1.png', date: 'Oct 22, 2024' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          row.action === 'Upload' ? 'bg-emerald-100 text-emerald-700' :
                          row.action === 'Download' ? 'bg-blue-100 text-blue-700' :
                          row.action === 'Share' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                        }`}>{row.action}</span>
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[150px]">{row.asset}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

function MetricCard({ title, value, change, trend = 'up', icon, color, bg }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
          {change}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
      </div>
    </div>
  );
}
