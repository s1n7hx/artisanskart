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
  Trash2,
  Sliders,
  Crop,
} from 'lucide-react';
import { processAndUploadImage } from '../services/supabase';
import { ImageCropperModal } from './ImageCropperModal';

interface MultiImageUploaderProps {
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primary: string) => void;
  maxImages?: number;
  minImages?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images = [],
  primaryImage = '',
  onChange,
  maxImages = 8,
  minImages = 1,
  label = 'Product Photographs',
  helperText = 'Upload 1 or more photos. First or starred photo is the primary storefront photo. Use the buttons below each thumbnail to Crop, Set as Primary, or Remove.',
  className = '',
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper modal state for gallery images
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  // Normalize list: ensure primary is in the list
  const currentImages = Array.from(new Set([primaryImage, ...images].filter(Boolean)));
  const effectivePrimary = primaryImage && currentImages.includes(primaryImage)
    ? primaryImage
    : currentImages[0] || '';

  const handleFilesSelected = async (files: FileList | File[]) => {
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

    // Open cropper for the first file, queue the rest
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setRawImageForCrop(result);
        setEditingImageIndex(null); // new upload
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(validFiles[0]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsUploading(true);
      setUploadProgress('Optimizing & uploading cropped image...');

      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      const croppedFile = new File([blob], `gallery_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const permanentUrl = await processAndUploadImage(croppedFile);

      if (editingImageIndex !== null && editingImageIndex >= 0) {
        // Replacing / updating existing image at index
        const list = [...currentImages];
        const oldUrl = list[editingImageIndex];
        list[editingImageIndex] = permanentUrl;
        const newPrimary = effectivePrimary === oldUrl ? permanentUrl : effectivePrimary;
        onChange(list, newPrimary);
      } else {
        // Adding new cropped image
        const updated = [...currentImages, permanentUrl];
        const newPrimary = effectivePrimary || updated[0] || '';
        onChange(updated, newPrimary);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading cropped image.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setRawImageForCrop(null);
      setEditingImageIndex(null);
    }
  };

  const handleOpenCropperForExisting = (imgUrl: string, index: number) => {
    setRawImageForCrop(imgUrl);
    setEditingImageIndex(index);
    setIsCropperOpen(true);
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
    const remaining = currentImages.filter((img) => img !== targetUrl);
    const reordered = [targetUrl, ...remaining];
    onChange(reordered, targetUrl);
  };

  const handleRemoveImage = (targetUrl: string) => {
    const updated = currentImages.filter((img) => img !== targetUrl);
    const newPrimary = effectivePrimary === targetUrl ? (updated[0] || '') : effectivePrimary;
    onChange(updated, newPrimary);
  };

  const handleRemoveAllExtraImages = () => {
    if (currentImages.length <= 1) return;
    const primary = effectivePrimary || currentImages[0];
    onChange([primary], primary);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentImages.length) return;

    const list = [...currentImages];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    onChange(list, list[0]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {helperText && <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>}
        </div>
        <span className="text-xs font-extrabold text-[#C85A32] bg-[#C85A32]/10 px-3 py-1 rounded-full">
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
            handleFilesSelected(e.dataTransfer.files);
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
              handleFilesSelected(e.target.files);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
          <div className="w-10 h-10 rounded-full bg-white border border-[#e7e0d8] flex items-center justify-center text-[#C85A32] shadow-xs">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Crop className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              {isUploading
                ? uploadProgress || 'Processing photographs...'
                : 'Click to upload & crop photos or drag & drop here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Each photo can be cropped independently (1:1, 4:5, 3:4 aspect ratios &amp; zoom)
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
            className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#C85A32]"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || currentImages.length >= maxImages}
          className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 disabled:opacity-50 transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add URL</span>
        </button>
      </div>

      {/* Minimum Photos Requirement Status */}
      {currentImages.length < minImages ? (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Please add at least 1 primary photograph</strong> of your craft to display in the marketplace.
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">
              Ready for catalog ({currentImages.length} {currentImages.length === 1 ? 'photo' : 'photos'}).
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            ★ Primary: #{currentImages.indexOf(effectivePrimary) + 1}
          </span>
        </div>
      )}

      {/* Image Gallery Previews Grid with Clearly Visible Controls BELOW Each Thumbnail */}
      {currentImages.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-700">
              Product Gallery Photos ({currentImages.length})
            </p>
            {currentImages.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveAllExtraImages}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer"
                title="Remove all extra pictures and keep only the primary photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Extra Pictures ({currentImages.length - 1})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentImages.map((imgUrl, index) => {
              const isPrimary = imgUrl === effectivePrimary;

              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`rounded-2xl overflow-hidden border-2 bg-white shadow-xs transition ${
                    isPrimary ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20' : 'border-slate-200'
                  }`}
                >
                  {/* Photo Thumbnail Preview */}
                  <div
                    onClick={() => handleOpenCropperForExisting(imgUrl, index)}
                    className="aspect-square w-full bg-slate-100 overflow-hidden relative cursor-pointer group"
                    title="Click to Crop & Resize"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />

                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-[#C85A32] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-white" /> Primary
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-[#C85A32] text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crop className="w-3.5 h-3.5" /> Crop Image
                      </span>
                    </div>
                  </div>

                  {/* 3 Clearly Visible Controls Directly BELOW Thumbnail */}
                  <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Photo #{index + 1}</span>
                      {isPrimary && (
                        <span className="text-[10px] bg-[#C85A32] text-white px-2 py-0.5 rounded-full font-extrabold uppercase">
                          Storefront Main
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenCropperForExisting(imgUrl, index)}
                        className="w-full py-2 px-3 bg-[#C85A32] hover:bg-[#b04a25] text-white rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Crop Image</span>
                      </button>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(imgUrl)}
                          className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>Set as Primary</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgUrl)}
                        className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {rawImageForCrop && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageForCrop}
          onClose={() => {
            setIsCropperOpen(false);
            setRawImageForCrop(null);
            setEditingImageIndex(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
