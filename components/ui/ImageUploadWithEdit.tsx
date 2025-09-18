'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
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
  const [CropperComponent, setCropperComponent] = useState<any>(null);

  // Dynamically import the Cropper component on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-easy-crop').then((module) => {
        setCropperComponent(() => module.default);
      });
    }
  }, []);

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
  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
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
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto luxury-image-upload">
      {label && (
        <H4 className="mb-2 text-gold-700 font-serif">
          {label} {required && <span className="text-red-500">*</span>}
        </H4>
      )}
      <div
        className={`${luxuryBorder} relative bg-white dark:bg-gray-800 p-8 text-center cursor-pointer transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={openFileDialog}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
          disabled={disabled}
        />
        {imageSrc ? (
          <div className="relative">
            <Image
              src={imageSrc}
              alt="Preview"
              width={200}
              height={200}
              className="mx-auto rounded-lg object-cover"
            />
            <div className="mt-4 flex space-x-2 justify-center">
              <Button 
                onClick={() => { 
                  if (inputRef.current) {
                    inputRef.current.click();
                  }
                }} 
                disabled={disabled}
              >
                Change
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => { 
                  handleRemove(); 
                }} 
                disabled={disabled}
              >
                Remove
              </Button>
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-amber-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>}

      {/* Crop Modal */}
      <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} title="Crop Image">
        <div className="space-y-4">
          {imageSrc && CropperComponent && (
            <div className="relative h-80 w-full">
              <CropperComponent
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                classes={{ containerClassName: 'rounded-lg overflow-hidden' }}
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom:</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCropModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCropSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>

          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImageUploadWithEdit;