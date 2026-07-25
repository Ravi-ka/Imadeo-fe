'use client';

import React, { useState } from 'react';
import { UploadCloud, X, File, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from './types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newAsset: Asset) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setProgress(0);
            
            // Generate mock uploaded asset
            const fileName = selectedFile?.name || 'Imadeo_Brand_Asset_Upload.png';
            const ext = fileName.split('.').pop()?.toUpperCase() || 'PNG';

            const newAsset: Asset = {
              id: `asset-${Date.now()}`,
              name: fileName,
              type: ext === 'MP4' || ext === 'MOV' ? 'video' : ext === 'PDF' ? 'document' : 'image',
              extension: ext,
              size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.5 MB',
              sizeBytes: selectedFile?.size || 3670016,
              dimensions: '3840 x 2160',
              thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              updatedAt: 'Just now',
              createdAt: '2026-07-25',
              owner: {
                name: 'Alex Morgan',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                email: 'alex.m@imadeo.io'
              },
              isFavorite: false,
              isShared: false,
              tags: ['New Upload', '2026'],
              description: 'Newly uploaded media asset processed by Imadeo DAM engine.',
              path: `/Root/Uploads/${fileName}`
            };

            onUploadSuccess(newAsset);
            setSelectedFile(null);
            onClose();
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Upload Media Assets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag and drop high-res images, 4K videos, documents or design files.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e: any) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              };
              input.click();
            }}
            className="group relative w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <span className="font-bold text-sm text-primary flex items-center justify-center gap-1.5">
                  <File className="w-4 h-4" /> {selectedFile.name}
                </span>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready for processing
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG, MP4, MOV, PDF, FIG up to 500MB
                </p>
              </div>
            )}
          </div>

          {/* Uploading Progress bar if active */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Optimizing and indexing asset...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              {isUploading ? 'Uploading...' : 'Start Upload'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
