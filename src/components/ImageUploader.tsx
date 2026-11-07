import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2, Sparkles, Sliders, Crop } from 'lucide-react';
import { processAndUploadImage } from '../services/supabase';
import { ImageCropperModal } from './ImageCropperModal';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  previewHeight?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  helperText,
  className = '',
  previewHeight = 'h-40',
  placeholder = 'https://images.pexels.com/...',
}) => {
  const isDataUrl = value?.startsWith('data:') || value?.startsWith('blob:');
  const [mode, setMode] = useState<'device' | 'url'>(isDataUrl ? 'device' : 'url');
  const [urlInput, setUrlInput] = useState(value && !isDataUrl ? value : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper modal state
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setErrorMsg('Failed to read image file.');
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setRawImageForCrop(result);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);

      // Convert cropped data url to File object
      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      const croppedFile = new File([blob], `cropped_image_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload optimized cropped image to Supabase Storage bucket
      const permanentUrl = await processAndUploadImage(croppedFile);
      onChange(permanentUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload cropped image.');
    } finally {
      setIsProcessing(false);
      setRawImageForCrop(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
        </div>
      )}

      {/* Mode Selection Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMode('device')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            mode === 'device'
              ? 'bg-white text-[#C85A32] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload &amp; Crop</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            mode === 'url'
              ? 'bg-white text-[#C85A32] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste Image Link</span>
        </button>
      </div>

      {/* Mode 1: Device Upload & Crop Dropzone */}
      {mode === 'device' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
              isDragging
                ? 'border-[#C85A32] bg-[#C85A32]/5'
                : 'border-slate-300 hover:border-[#C85A32] hover:bg-slate-50/80 bg-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-3 space-y-2 text-[#C85A32]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Optimizing &amp; uploading cropped image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <Crop className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-900">
                  Click to upload &amp; crop <span className="font-normal text-slate-500">or drag &amp; drop</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, PNG, WEBP • Opens cropper with 1:1, 4:5, 3:4 aspect ratios &amp; zoom
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Paste Image Link */}
      {mode === 'url' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              onBlur={handleUrlApply}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-hidden focus:border-[#C85A32]"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {errorMsg}
        </p>
      )}

      {/* Live Preview Box with Clearly Visible Orange [ Crop Image ] Button */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
          <div
            onClick={() => {
              setRawImageForCrop(value);
              setIsCropperOpen(true);
            }}
            className={`${previewHeight} w-full overflow-hidden flex items-center justify-center bg-slate-100 cursor-pointer relative group/img`}
            title="Click to open cropping editor"
          >
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover group-hover/img:scale-102 transition duration-300"
              onError={() => setErrorMsg('Failed to load image preview. Check link or re-upload file.')}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="px-3.5 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Crop className="w-4 h-4" /> Click to Crop &amp; Resize
              </span>
            </div>
          </div>

          <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-800 truncate">
                {value.startsWith('data:')
                  ? 'Cropped Image (Ready)'
                  : value.startsWith('blob:')
                  ? 'Local Preview'
                  : 'Permanent Storage URL Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRawImageForCrop(value);
                  setIsCropperOpen(true);
                }}
                className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#b04a25] text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Crop Image</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'device') {
                    fileInputRef.current?.click();
                  } else {
                    setUrlInput('');
                    onChange('');
                  }
                }}
                className="px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition cursor-pointer flex items-center gap-1"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${previewHeight} rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs`}>
          <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
          <span>No image selected yet</span>
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
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
