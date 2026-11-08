import React, { useState, useCallback } from 'react';
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
      case '16:9':
        return 16 / 9;
      case 'free':
      case 'original':
      default:
        return undefined; // Free aspect ratio
    }
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
    rotation = 0,
    flip = { horizontal: false, vertical: false }
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
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
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
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Aspect Ratio Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'free', label: 'Free' },
                { id: '1:1', label: '1:1 Square (Storefront)' },
                { id: '4:5', label: '4:5 Portrait' },
                { id: '3:4', label: '3:4 Craft Card' },
                { id: '16:9', label: '16:9 Banner' },
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
          <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
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
              transform={`translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`}
            />
          </div>

          {/* Toolbar: Zoom, Rotate Left/Right, Flip H/V, Reset */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-[#C85A32]" /> Zoom Level</span>
                <span>{zoom.toFixed(2)}x</span>
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
                    flip.horizontal ? 'bg-[#C85A32] text-white border-[#C85A32]' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Flip Horizontally"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFlipVertical}
                  className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 ${
                    flip.vertical ? 'bg-[#C85A32] text-white border-[#C85A32]' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
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
};
