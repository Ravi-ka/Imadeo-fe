'use client';

import React, { useState } from 'react';
import { UploadCloud, X, File, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from './types';

import { useAuth } from '@clerk/nextjs';
import { presignAssetApi, completeAssetUploadApi } from '@/services/assetService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newAsset: Asset) => void;
  activeTenantId: string;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess, activeTenantId }: UploadModalProps) {
  const { getToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSimulatedUpload = async () => {
    setIsUploading(true);
    setProgress(10);

    const uploaderName = user 
      ? (user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Alex Morgan')
      : 'Alex Morgan';

    const uploaderEmail = user?.primaryEmailAddress?.emailAddress || 'alex.m@imadeo.io';
    const uploaderAvatar = user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    // Simulate progress async without interval side effects
    for (let i = 1; i <= 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setProgress(10 + i * 22.5); // reaches ~100
    }

    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 400));

    // Try to presign (simulated or real depending on backend readiness)
    let uploadedAsset: Asset | null = null;
    try {
      const token = await getToken({ skipCache: true });
      if (token && selectedFile) {
        const { uploadUrl, assetId } = await presignAssetApi(token, {
          name: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          sizeBytes: selectedFile.size
        }, activeTenantId);
        
        // Upload the actual binary file directly to R2 using the presigned URL
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type || 'application/octet-stream'
          }
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file to storage');
        }

        // Notify backend that upload is complete to process metadata/save asset
        const completeRes = await completeAssetUploadApi(token, assetId, activeTenantId);
        uploadedAsset = completeRes.asset;
      }
    } catch (e) {
      console.warn("Upload failed, falling back to mock data for UI demo", e);
    }

    // Generate mock uploaded asset if backend failed or returned nothing
    const fileName = selectedFile?.name || 'Imadeo_Brand_Asset_Upload.png';
    const ext = fileName.split('.').pop()?.toUpperCase() || 'PNG';

    const newAsset: Asset = uploadedAsset || {
      id: `asset-${Date.now()}`,
      name: fileName,
      type: ext === 'MP4' || ext === 'MOV' ? 'video' : ext === 'PDF' ? 'document' : 'image',
      extension: ext,
      size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.5 MB',
      sizeBytes: selectedFile?.size || 3670016,
      dimensions: '3840 x 2160',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      updatedAt: 'Just now',
      createdAt: new Date().toISOString(),
      owner: {
        name: uploaderName,
        avatarUrl: uploaderAvatar,
        email: uploaderEmail
      },
      isFavorite: false,
      isShared: false,
      tags: ['New Upload', '2026'],
      description: 'Newly uploaded media asset processed by Imadeo DAM engine.',
      path: `/Root/Uploads/${fileName}`
    };

    setIsUploading(false);
    setProgress(0);
    onUploadSuccess(newAsset);
    setSelectedFile(null);
    onClose();
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
