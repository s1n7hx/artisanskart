import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { processAndUploadImage } from '../services/supabase';

interface MultiImageUploaderProps {
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primary: string) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images = [],
  primaryImage = '',
  onChange,
  maxImages = 8,
  label = 'Product Photographs',
  helperText = 'Upload at least 1 and up to 8 photos. First or starred photo is the primary storefront photo.',
  className = '',
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize list: ensure primary is in the list
  const currentImages = Array.from(new Set([primaryImage, ...images].filter(Boolean)));
  const effectivePrimary = primaryImage && currentImages.includes(primaryImage)
    ? primaryImage
    : currentImages[0] || '';

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Only image files (JPG, PNG, WebP, GIF) are accepted.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (currentImages.length + validFiles.length > maxImages) {
      setErrorMsg(`You can upload a maximum of ${maxImages} photographs per craft.`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`);
        const url = await processAndUploadImage(validFiles[i]);
        if (url && !currentImages.includes(url) && !uploadedUrls.includes(url)) {
          uploadedUrls.push(url);
        }
      }

      const updated = [...currentImages, ...uploadedUrls];
      const newPrimary = effectivePrimary || updated[0] || '';
      onChange(updated, newPrimary);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading photographs. Please retry.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    setErrorMsg(null);
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMsg('Please enter a valid web image URL (must start with https://).');
      return;
    }

    if (currentImages.includes(trimmed)) {
      setErrorMsg('This photograph URL is already added.');
      return;
    }

    if (currentImages.length >= maxImages) {
      setErrorMsg(`Maximum ${maxImages} photographs reached.`);
      return;
    }

    const updated = [...currentImages, trimmed];
    const newPrimary = effectivePrimary || trimmed;
    onChange(updated, newPrimary);
    setUrlInput('');
  };

  const handleSetPrimary = (targetUrl: string) => {
    // Put primary at the front of images list for consistency
    const remaining = currentImages.filter((img) => img !== targetUrl);
    const reordered = [targetUrl, ...remaining];
    onChange(reordered, targetUrl);
  };

  const handleRemoveImage = (targetUrl: string) => {
    const updated = currentImages.filter((img) => img !== targetUrl);
    const newPrimary = effectivePrimary === targetUrl ? (updated[0] || '') : effectivePrimary;
    onChange(updated, newPrimary);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentImages.length) return;

    const list = [...currentImages];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // The first image remains or becomes primary
    onChange(list, list[0]);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {helperText && <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>}
        </div>
        <span className="text-xs font-extrabold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-0.5 rounded-full">
          {currentImages.length} / {maxImages} Photos
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-800 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer ${
          isDragging
            ? 'border-[#C85A32] bg-[#C85A32]/5 scale-[0.99]'
            : 'border-slate-300 hover:border-[#C85A32] bg-[#FAF9F6]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
          <div className="w-10 h-10 rounded-full bg-white border border-[#e7e0d8] flex items-center justify-center text-[#C85A32] shadow-xs">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isUploading
                ? uploadProgress || 'Processing photographs...'
                : 'Click to select multiple photos or drag and drop here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              High resolution JPG, PNG, WebP up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Add by Image URL Alternative */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or paste an image web URL (https://...)"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#C85A32]"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || currentImages.length >= maxImages}
          className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 disabled:opacity-50 transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add URL</span>
        </button>
      </div>

      {/* Image Gallery Previews Grid with Controls */}
      {currentImages.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-slate-600">
            Uploaded Photos ({currentImages.length}) — Click star to set primary, use arrows to reorder
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentImages.map((imgUrl, index) => {
              const isPrimary = imgUrl === effectivePrimary;

              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs transition ${
                    isPrimary ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20' : 'border-slate-200'
                  }`}
                >
                  {/* Photo Preview */}
                  <div className="aspect-square w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={imgUrl}
                      alt={`Product Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#C85A32] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" /> Primary
                      </span>
                    )}

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(imgUrl)}
                          title="Make Primary Storefront Photo"
                          className="p-1.5 rounded-full bg-white text-amber-500 hover:bg-amber-50 shadow-md cursor-pointer transition"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'left')}
                          title="Move Left"
                          className="p-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-md cursor-pointer transition"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {index < currentImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'right')}
                          title="Move Right"
                          className="p-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-md cursor-pointer transition"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgUrl)}
                        title="Remove Photo"
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Bottom Bar */}
                  <div className="p-2 flex items-center justify-between text-[11px] bg-slate-50 border-t border-slate-100">
                    <span className="font-bold text-slate-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(imgUrl)}
                      className={`text-[10px] font-bold cursor-pointer transition ${
                        isPrimary
                          ? 'text-[#C85A32]'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {isPrimary ? '★ Primary' : 'Make Primary'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
