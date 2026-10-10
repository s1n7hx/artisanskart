import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2, Sparkles } from 'lucide-react';
import { processAndUploadImage } from '../services/supabase';

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
  previewHeight = 'h-36',
  placeholder = 'https://images.pexels.com/...',
}) => {
  // Determine initial tab: if value is already a data: URL or blob:, default to 'device', otherwise 'url'
  const isDataUrl = value?.startsWith('data:') || value?.startsWith('blob:');
  const [mode, setMode] = useState<'device' | 'url'>(isDataUrl ? 'device' : 'url');
  const [urlInput, setUrlInput] = useState(value && !isDataUrl ? value : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const processedUrl = await processAndUploadImage(file);
      onChange(processedUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
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
      handleFile(file);
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
    <div className={`space-y-2.5 ${className}`}>
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
            mode === 'device'
              ? 'bg-white text-[#C85A32] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload from Device</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
            mode === 'url'
              ? 'bg-white text-[#C85A32] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste Image Link</span>
        </button>
      </div>

      {/* Mode 1: Device Upload Dropzone */}
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
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
              isDragging
                ? 'border-[#C85A32] bg-[#C85A32]/5'
                : 'border-slate-300 hover:border-[#C85A32] hover:bg-slate-50/80 bg-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-3 space-y-2 text-[#C85A32]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Optimizing &amp; uploading image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to browse from device <span className="font-normal text-slate-500">or drag &amp; drop</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, PNG, WEBP, GIF (camera, screenshot, phone gallery)
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-hidden focus:border-[#C85A32]"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
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

      {/* Live Preview Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <div className={`${previewHeight} w-full overflow-hidden flex items-center justify-center bg-slate-100`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
              onError={() => setErrorMsg('Failed to load image preview. Check link or re-upload file.')}
            />
          </div>

          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-700 truncate">
                {value.startsWith('data:')
                  ? 'Device Photo (Optimized & Embedded)'
                  : value.startsWith('blob:')
                  ? 'Device Photo (Local Preview)'
                  : 'Web Photo Link Active'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold transition cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
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
    </div>
  );
};
