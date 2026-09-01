'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from './types';

import { useUploadAsset } from '@/hooks/useAssets';
import { useUploadStore } from '@/store/useUploadStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newAsset: Asset) => void;
  activeTenantId: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg','image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'application/pdf', 'text/plain', 'application/zip'
];

export function UploadModal({ isOpen, onClose, onUploadSuccess, activeTenantId }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFolderId = useUploadStore((s) => s.uploadFolderId);
  const { mutateAsync: uploadAsset } = useUploadAsset(activeTenantId, uploadFolderId);

  const resetDragState = () => {
    dragCounter.current = 0;
    setIsDragging(false);
  };

  const applyFile = (file: File | undefined) => {
    if (!file || isUploading) return;
    setErrorMsg(null);
    setSelectedFile(file);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    resetDragState();
    onClose();
  };

  const preventBrowserOpen = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    preventBrowserOpen(e);
    if (isUploading) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    preventBrowserOpen(e);
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      resetDragState();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    preventBrowserOpen(e);
    if (isUploading) return;
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    preventBrowserOpen(e);
    resetDragState();
    if (isUploading) return;
    applyFile(e.dataTransfer.files?.[0]);
  };

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (selectedFile.size > 104857600) {
      setErrorMsg('File size must be less than 100MB');
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      setErrorMsg(`File type ${selectedFile.type || 'unknown'} is not supported`);
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setProgress(20);

    try {
      setProgress(50);
      const newAsset = await uploadAsset(selectedFile);
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadSuccess(newAsset);
        handleClose();
      }, 500);
    } catch (e: any) {
      console.error("Upload failed", e);
      setErrorMsg(e.message || "Failed to upload asset");
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onDragOver={preventBrowserOpen}
        onDrop={preventBrowserOpen}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onDragOver={preventBrowserOpen}
          onDrop={preventBrowserOpen}
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
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_MIME_TYPES.join(',')}
            disabled={isUploading}
            onChange={(e) => {
              applyFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          {/* Drag & Drop Area */}
          <div
            onClick={() => {
              if (isUploading) return;
              fileInputRef.current?.click();
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`group relative w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/10 dark:bg-primary/15'
                : 'border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-950/50'
            }`}
          >
            <div className="pointer-events-none w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile && !isDragging ? (
              <div className="pointer-events-none space-y-1">
                <span className="font-bold text-sm text-primary flex items-center justify-center gap-1.5">
                  <File className="w-4 h-4" /> {selectedFile.name}
                </span>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready for processing
                </p>
              </div>
            ) : (
              <div className="pointer-events-none space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isDragging ? (
                    'Drop file to upload'
                  ) : (
                    <>
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </>
                  )}
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

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
              {errorMsg}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
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
