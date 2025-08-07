import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import Button from './Button';
import Modal from './Modal';
import { H4 } from './Typography';

interface ImageUploadWithEditProps {
  aspect?: number; // e.g. 16/9, 1, etc.
  minWidth?: number;
  minHeight?: number;
  value?: string | null; // image URL or base64
  onChange: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

const luxuryBorder =
  'border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gold-500 transition-all duration-200';

export const ImageUploadWithEdit: React.FC<ImageUploadWithEditProps> = ({
  aspect = 1,
  value,
  onChange,
  label = 'Upload Image',
  helperText,
  required = false,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(value || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Cleanup blob URL on unmount or when a new one is set
  useEffect(() => {
    return () => {
      if (blobUrl) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.warn('Failed to revoke blob URL:', error);
        }
      }
    };
  }, [blobUrl]);

  // Handle file selection
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag & drop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cropper callbacks
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Get cropped image as file
  const getCroppedImg = async (
    imageSrc: string,
    crop: { x: number; y: number; width: number; height: number },
  ) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return new Promise<{ file: File; url: string }>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          resolve({ file, url });
        },
        'image/jpeg',
        0.9,
      );
    });
  };

  // Save cropped image and upload to server
  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    setError(null);
    try {
      const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Upload to /api/upload
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }
      const data = await res.json();
      const uploadedUrl = data.url;

      // Clean up blob URL safely
      if (blobUrl) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.warn('Failed to revoke blob URL:', error);
        }
      }

      setBlobUrl(null);
      setImageSrc(uploadedUrl);
      setShowCropModal(false);
      onChange(file, uploadedUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to crop or upload image.');
    } finally {
      setLoading(false);
    }
  };

  // Remove image
  const handleRemove = () => {
    if (blobUrl) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', error);
      }
    }
    setBlobUrl(null);
    setImageSrc(null);
    onChange(null, null);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto luxury-image-upload">
      {label && (
        <H4 className="mb-2 text-gold-700 font-serif">
          {label} {required && <span className="text-red-500">*</span>}
        </H4>
      )}
      <div
        className={`relative flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6 ${luxuryBorder} min-h-[220px] cursor-pointer transition-all duration-200 ${disabled ? 'opacity-60 pointer-events-none' : 'hover:shadow-gold-lg'}`}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
        aria-disabled={disabled}
      >
        {!imageSrc ? (
          <>
            <span className="text-gray-400 text-3xl mb-2">＋</span>
            <span className="text-gray-500 font-medium">Drag & drop or click to upload</span>
            {helperText && <span className="text-xs text-gray-400 mt-2">{helperText}</span>}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              disabled={disabled}
              aria-label={label}
            />
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full h-48 mb-4">
              <Image
                src={imageSrc}
                alt="Preview"
                fill
                className="rounded-lg shadow-lg object-cover border border-gold-200"
                style={{ aspectRatio: aspect }}
                sizes="(max-width: 400px) 100vw, 400px"
                unoptimized
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="primary" onClick={() => setShowCropModal(true)}>
                Edit
              </Button>
              <Button type="button" variant="outline" onClick={openFileDialog}>
                Replace
              </Button>
              <Button type="button" variant="outline" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
            <span className="text-gold-600 font-bold animate-pulse">Processing...</span>
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      {/* Crop Modal */}
      <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} title="Edit Image">
        <div className="p-4 w-full max-w-lg mx-auto">
          <H4 className="mb-2 text-gold-700 font-serif">Edit Image</H4>
          <div className="relative w-full h-72 bg-gray-100 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                minZoom={1}
                maxZoom={3}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-xs text-gray-500">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowCropModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleCropSave} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImageUploadWithEdit;
