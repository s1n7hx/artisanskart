import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut, RefreshCw, Sliders } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export type AspectRatioOption = '1:1' | '4:5' | '3:4' | 'original';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const getAspectValue = (option: AspectRatioOption): number | undefined => {
    switch (option) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '3:4':
        return 3 / 4;
      case 'original':
      default:
        return undefined;
    }
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context available');
    }

    const rotRad = (rotation * Math.PI) / 180;

    const bBoxWidth =
      Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bBoxHeight =
      Math.abs(Math.sin(rotRad) * image.height) + Math.abs(Math.cos(rotRad) * image.width);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, bBoxWidth, bBoxHeight);

    canvas.width = Math.max(1, pixelCrop.width);
    canvas.height = Math.max(1, pixelCrop.height);

    ctx.putImageData(
      data,
      Math.round(0 - pixelCrop.x),
      Math.round(0 - pixelCrop.y)
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
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
    if (!croppedAreaPixels || !imageSrc) return;
    setIsProcessing(true);

    try {
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      setIsProcessing(false);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error generating cropped image:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Professional Image Cropper</h2>
              <p className="text-xs text-slate-500">Crop, zoom, rotate &amp; preview before saving</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Workspace */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '1:1', label: '1:1 Square (Storefront)' },
                { id: '4:5', label: '4:5 Portrait' },
                { id: '3:4', label: '3:4 Craft Card' },
                { id: 'original', label: 'Original (Free)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id as AspectRatioOption)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
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

          {/* Interactive react-easy-crop Container */}
          <div className="relative w-full h-72 sm:h-80 bg-slate-900 rounded-2xl overflow-hidden">
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
            />
          </div>

          {/* Controls: Zoom & Rotate */}
          <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-[#C85A32]" /> Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#C85A32] cursor-pointer"
              />
            </div>

            {/* Rotate & Reset */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
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
                <span>Generating Crop...</span>
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
};
