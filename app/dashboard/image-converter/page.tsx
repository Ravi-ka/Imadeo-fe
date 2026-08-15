'use client';

import React from 'react';
import { Header } from '@/components/dam/Header';
import { UploadCloud, Image as ImageIcon, Minimize, Maximize, Crop, FileType2, Zap, Download } from 'lucide-react';

export default function ImageConverterPage() {
  return (
    <>
      <Header
        title="Image Converter"
        breadcrumbs={['Home', 'Tools', 'Image Converter']}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenUpload={() => {}}
        totalAssetsCount={0}
        isViewer={false}
      />

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
            <FileType2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Convert & Optimize Images</h1>
          <p className="text-slate-500 text-lg">
            Convert, resize, optimize, and transform images from one place. Prepare your assets for web, social, or print in seconds.
          </p>
        </div>

        {/* Dropzone Placeholder */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-not-allowed opacity-80">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Drag and drop images here</h3>
          <p className="text-slate-500 mb-6">Supported formats: PNG, JPG, WEBP, AVIF, SVG (Max 50MB)</p>
          <button disabled className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold opacity-50 cursor-not-allowed">
            Browse Files
          </button>
        </div>

        {/* Tools Grid */}
        <div className="pt-8">
          <h2 className="text-xl font-bold mb-6">Available Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Convert Format', desc: 'Change image formats (e.g., PNG to JPG)', icon: <FileType2 className="w-5 h-5" /> },
              { title: 'Compress Image', desc: 'Reduce file size without losing quality', icon: <Minimize className="w-5 h-5" /> },
              { title: 'Resize Image', desc: 'Scale images to specific dimensions', icon: <Maximize className="w-5 h-5" /> },
              { title: 'Crop Image', desc: 'Trim edges and adjust aspect ratios', icon: <Crop className="w-5 h-5" /> },
              { title: 'Convert to WEBP', desc: 'Next-gen format for faster web loading', icon: <Zap className="w-5 h-5" /> },
              { title: 'Batch Processing', desc: 'Apply transformations to multiple files', icon: <ImageIcon className="w-5 h-5" /> },
            ].map((tool, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group opacity-80 cursor-not-allowed">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                    Coming Soon
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h4 className="font-bold mb-1 text-slate-700 dark:text-slate-300">{tool.title}</h4>
                <p className="text-sm text-slate-500">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-xl font-bold mb-8">How it works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center max-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">1. Upload</h4>
              <p className="text-xs text-slate-500 mt-1">Select the images you want to transform.</p>
            </div>
            <div className="hidden md:block w-16 h-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex flex-col items-center max-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <FileType2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">2. Transform</h4>
              <p className="text-xs text-slate-500 mt-1">Choose your tools and settings.</p>
            </div>
            <div className="hidden md:block w-16 h-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex flex-col items-center max-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">3. Download</h4>
              <p className="text-xs text-slate-500 mt-1">Save the optimized assets back to your library.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
