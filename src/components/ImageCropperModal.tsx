import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut, RefreshCw, Sliders, FlipHorizontal, FlipVertical } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export type AspectRatioOption = 'free' | '1:1' | '4:5' | '3:4' | '16:9' | 'original';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({ horizontal: false, vertical: false });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock body scroll and handle Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset transforms whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setCroppedAreaPixels(null);
      setErrorMsg(null);
    }
  }, [isOpen, imageSrc]);

  const getAspectValue = (option: AspectRatioOption): number | undefined => {
    switch (option) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '3:4':
        return 3 / 4;
      case '16:9':
        return 16 / 9;
      case 'original':
        return mediaSize?.naturalWidth && mediaSize?.naturalHeight
          ? mediaSize.naturalWidth / mediaSize.naturalHeight
          : undefined;
      case 'free':
      default:
        return undefined;
    }
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, pixels: any) => {
    if (pixels && pixels.width > 0 && pixels.height > 0) {
      setCroppedAreaPixels(pixels);
    }
  }, []);

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
  };

  const handleFlipVertical = () => {
    setFlip((prev) => ({ ...prev, vertical: !prev.vertical }));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setCrop({ x: 0, y: 0 });
    setAspectRatio('1:1');
    setErrorMsg(null);
  };

  const createImage = async (url: string): Promise<HTMLImageElement> => {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
        image.src = url;
      });
    }

    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (error) => reject(error);
          image.src = objectUrl;
        });
      }
    } catch {
      // Fallback
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = (err) => reject(err);
        fallback.src = url;
      };
      const separator = url.includes('?') ? '&' : '?';
      image.src = `${url}${separator}_t=${Date.now()}`;
    });
  };

  const getCroppedImg = async (
    sourceUrl: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotationDeg = 0,
    flipConfig = { horizontal: false, vertical: false }
  ): Promise<string> => {
    const image = await createImage(sourceUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }

    const rotRad = (rotationDeg * Math.PI) / 180;
    const bBoxWidth =
      Math.abs(Math.cos(rotRad) * image.naturalWidth) + Math.abs(Math.sin(rotRad) * image.naturalHeight);
    const bBoxHeight =
      Math.abs(Math.sin(rotRad) * image.naturalHeight) + Math.abs(Math.cos(rotRad) * image.naturalWidth);

    canvas.width = Math.round(bBoxWidth);
    canvas.height = Math.round(bBoxHeight);

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flipConfig.horizontal ? -1 : 1, flipConfig.vertical ? -1 : 1);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const targetWidth = Math.max(1, Math.round(pixelCrop.width));
    const targetHeight = Math.max(1, Math.round(pixelCrop.height));

    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      throw new Error('Failed to create destination canvas');
    }

    croppedCtx.drawImage(
      canvas,
      Math.round(pixelCrop.x),
      Math.round(pixelCrop.y),
      targetWidth,
      targetHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Cropped canvas generation returned empty blob'));
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (error) => reject(error);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleApplyCrop = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const activeCrop = croppedAreaPixels || {
        x: 0,
        y: 0,
        width: mediaSize?.naturalWidth || 800,
        height: mediaSize?.naturalHeight || 800,
      };

      const croppedDataUrl = await getCroppedImg(imageSrc, activeCrop, rotation, flip);
      setIsProcessing(false);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err: any) {
      console.error('[ImageCropperModal] Error generating cropped image:', err);
      setErrorMsg(err?.message || 'Failed to generate cropped image. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Cropping Workspace"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] relative z-10 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Professional Photo Editor</h2>
              <p className="text-xs text-slate-500">Adjust crop, zoom, rotate, flip &amp; aspect ratios</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Close editor (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-500 hover:text-red-800 font-bold ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Aspect Ratio Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '1:1', label: '1:1 Square (Storefront)' },
                { id: '4:5', label: '4:5 Portrait' },
                { id: '3:4', label: '3:4 Craft Card' },
                { id: '16:9', label: '16:9 Banner' },
                { id: 'free', label: 'Free' },
                { id: 'original', label: 'Original' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id as AspectRatioOption)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    aspectRatio === item.id
                      ? 'bg-[#C85A32] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Cropper Area */}
          <div className="relative w-full h-72 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={getAspectValue(aspectRatio)}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteInternal}
              onMediaLoaded={(loaded) => setMediaSize(loaded)}
              transform={
                flip.horizontal || flip.vertical
                  ? `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`
                  : undefined
              }
            />
          </div>

          {/* Toolbar: Zoom, Rotate Left/Right, Flip H/V, Reset */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C85A32]" /> Zoom Level
                </span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.2).toFixed(2)))}
                  className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(2)))}
                  className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transform Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRotateLeft}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                  title="Rotate Left 90°"
                >
                  <RotateCw className="w-3.5 h-3.5 -scale-x-100" />
                  <span>Rotate -90°</span>
                </button>
                <button
                  type="button"
                  onClick={handleRotateRight}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate +90°</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFlipHorizontal}
                  className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 ${
                    flip.horizontal
                      ? 'bg-[#C85A32] text-white border-[#C85A32]'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Flip Horizontally"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFlipVertical}
                  className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 ${
                    flip.vertical
                      ? 'bg-[#C85A32] text-white border-[#C85A32]'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Flip Vertically"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  title="Reset all adjustments"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Final Image...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Crop &amp; Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

