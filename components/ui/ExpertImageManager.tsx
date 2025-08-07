import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { toast } from 'react-hot-toast';

interface ExpertImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  aspectRatio?: number;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  showAspectRatioOptions?: boolean;
}

// Predefined aspect ratios for different design requirements
const ASPECT_RATIO_OPTIONS = [
  { value: 1, label: 'Square (1:1)', description: 'Perfect for product thumbnails' },
  { value: 4 / 3, label: 'Landscape (4:3)', description: 'Traditional photo format' },
  { value: 16 / 9, label: 'Widescreen (16:9)', description: 'Modern video format' },
  { value: 3 / 4, label: 'Portrait (3:4)', description: 'Mobile-friendly vertical' },
  { value: 2 / 3, label: 'Tall Portrait (2:3)', description: 'Instagram story format' },
  { value: 3 / 2, label: 'Classic (3:2)', description: 'Traditional photography' },
  { value: 5 / 4, label: 'Standard (5:4)', description: 'Professional print format' },
  { value: 1.618, label: 'Golden Ratio (1.618:1)', description: 'Aesthetically pleasing' },
];

const ExpertImageManager: React.FC<ExpertImageManagerProps> = ({
  images = [],
  onChange,
  maxImages = 5,
  aspectRatio = 1,
  label = 'Product Images',
  helperText = 'Upload high-quality images (JPG, PNG, WebP). Max 5MB per image.',
  required = false,
  disabled = false,
  showAspectRatioOptions = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<
    Array<{ id: string; url: string; isUploading?: boolean }>
  >([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);

  // Initialize image data from props only once
  useEffect(() => {
    const initialData = images.map((url, index) => ({
      id: `img-${index}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      isUploading: false,
    }));
    setImageData(initialData);
  }, []); // Empty dependency array - only run once

  // Update parent when image data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const urls = imageData.map((img) => img.url).filter(Boolean);
      onChange(urls);
    }, 100); // Debounce to prevent excessive calls

    return () => clearTimeout(timeoutId);
  }, [imageData, onChange]);

  // Auto-reload after successful upload
  useEffect(() => {
    const uploadingCount = imageData.filter((img) => img.isUploading).length;
    if (uploadingCount === 0 && Object.keys(uploadProgress).length > 0) {
      // All uploads completed, clear progress
      setUploadProgress({});
      // Trigger a small delay to ensure database is updated
      setTimeout(() => {
        const uploadedCount = imageData.length;
        toast.success(
          `✅ ${uploadedCount} image${uploadedCount > 1 ? 's' : ''} uploaded successfully! Ready for professional cropping.`,
        );
        // Trigger a custom event to notify parent components
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('imagesUploaded', {
              detail: { success: true, count: imageData.length },
            }),
          );
        }, 500);
      }, 500);
    }
  }, [imageData, uploadProgress]);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPG, PNG, WebP).';
    }

    if (file.size > maxSize) {
      return 'Image size must be less than 5MB.';
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const newImages: Array<{ id: string; url: string; originalFile: File; isUploading: boolean }> =
      [];

    // Show processing feedback
    toast.success(`Processing ${files.length} image${files.length > 1 ? 's' : ''}...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Check if we have space for more images
      if (imageData.length + newImages.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed.`);
        break;
      }

      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}-${i}`;
      const tempUrl = URL.createObjectURL(file);

      newImages.push({
        id: tempId,
        url: tempUrl,
        originalFile: file,
        isUploading: true,
      });
    }

    if (newImages.length > 0) {
      // Update state in a single operation to prevent multiple re-renders
      setImageData((prev) => {
        const updated = [...prev, ...newImages];
        return updated;
      });

      // Upload images with progress tracking
      for (const newImage of newImages) {
        await uploadImage(newImage);
      }
    }
  };

  const uploadImage = async (imageData: {
    id: string;
    url: string;
    originalFile: File;
    isUploading: boolean;
  }) => {
    try {
      const formData = new FormData();
      formData.append('file', imageData.originalFile);

      // Track upload progress
      setUploadProgress((prev) => ({ ...prev, [imageData.id]: 0 }));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [imageData.id]: progress }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);

          setImageData((prev) =>
            prev.map((img) =>
              img.id === imageData.id ? { ...img, url: result.url, isUploading: false } : img,
            ),
          );

          // Cleanup blob URL
          try {
            URL.revokeObjectURL(imageData.url);
          } catch (error) {
            console.warn('Failed to revoke blob URL:', error);
          }

          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[imageData.id];
            return newProgress;
          });
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setImageData((prev) => prev.filter((img) => img.id !== imageData.id));
      toast.error('Failed to upload image');

      // Cleanup blob URL
      try {
        URL.revokeObjectURL(imageData.url);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', error);
      }

      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[imageData.id];
        return newProgress;
      });
    }
  };

  const handleCropComplete = useCallback((_, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = async (
    imageSrc: string,
    crop: any,
    rotation: number = 0,
  ): Promise<{ file: File; url: string }> => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No canvas context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - crop.x,
      0 - safeArea / 2 + image.height * 0.5 - crop.y,
    );

    return new Promise((resolve, reject) => {
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

  const handleCropSave = async () => {
    if (currentImageIndex === -1 || !croppedAreaPixels) return;

    try {
      const currentImage = imageData[currentImageIndex];
      const { file, url } = await getCroppedImage(currentImage.url, croppedAreaPixels, rotation);

      // Upload cropped image
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      setImageData((prev) =>
        prev.map((img, index) => (index === currentImageIndex ? { ...img, url: result.url } : img)),
      );

      setShowCropModal(false);
      setCurrentImageIndex(-1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);

      toast.success('✨ Image cropped and saved successfully! Professional quality achieved.');
    } catch (error) {
      console.error('Crop save error:', error);
      toast.error('Failed to save cropped image');
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imageData[index];

    // Cleanup blob URL if it's a temporary one
    if (imageToRemove.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(imageToRemove.url);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', error);
      }
    }

    setImageData((prev) => prev.filter((_, i) => i !== index));
    toast.success('🗑️ Image removed successfully');
  };

  const handleEditImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowCropModal(true);
    toast.success(
      '🎨 Professional editing mode activated! Use the controls below to perfect your image.',
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragActive to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Show immediate feedback
      toast.success(`Processing ${files.length} image${files.length > 1 ? 's' : ''}...`);
      handleFileSelect(files);
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Aspect Ratio Selection */}
      {showAspectRatioOptions && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-600">📐 Crop Aspect Ratio</label>
            <button
              onClick={() => setSelectedAspectRatio(aspectRatio)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              title="Reset to default ratio"
            >
              Reset to Default
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ASPECT_RATIO_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedAspectRatio(option.value)}
                className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                  selectedAspectRatio === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={disabled}
                title={option.description}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-gray-500 text-xs mt-1">{option.description}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>💡</span>
            <span>Select an aspect ratio before cropping for consistent design</span>
            <span className="text-blue-600 font-medium">
              Current:{' '}
              {ASPECT_RATIO_OPTIONS.find((opt) => opt.value === selectedAspectRatio)?.label ||
                'Custom'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Image Grid */}
        {imageData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageData.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors relative">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />

                  {/* Loading overlay */}
                  {image.isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <div className="text-white text-xs">
                          {uploadProgress[image.id]
                            ? `${uploadProgress[image.id]}%`
                            : 'Uploading...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditImage(index)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        title="Edit image"
                      >
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image number */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {imageData.length < maxImages && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {dragActive ? '🎯 Drop images here!' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">{helperText}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
              <span>
                {imageData.length} of {maxImages} images uploaded
              </span>
              <span className="text-blue-600">✨ Professional cropping available</span>
            </div>
            {dragActive && (
              <div className="mt-4 p-2 bg-blue-100 rounded-lg animate-pulse">
                <p className="text-blue-700 text-sm font-medium">✨ Release to upload images</p>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        {/* Error message */}
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 text-sm font-medium">Uploading images...</p>
            </div>
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="mb-3">
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                  <span>📸 Image {id.slice(-4)}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && currentImageIndex !== -1 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">Edit Image</h3>
                <p className="text-sm text-gray-500">
                  📐 Aspect Ratio:{' '}
                  {ASPECT_RATIO_OPTIONS.find((opt) => opt.value === selectedAspectRatio)?.label ||
                    'Custom'}
                </p>
              </div>
              <button
                onClick={() => setShowCropModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {/* Helpful Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm">💡</span>
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Pro Tips:</p>
                    <ul className="space-y-1">
                      <li>• Use zoom to focus on important details</li>
                      <li>• Rotate to straighten crooked images</li>
                      <li>• Change aspect ratio anytime during editing</li>
                      <li>• Click and drag to reposition the crop area</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Cropper
                  image={imageData[currentImageIndex]?.url}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={selectedAspectRatio}
                  minZoom={0.5}
                  maxZoom={3}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Aspect Ratio Quick Select */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📐 Quick Aspect Ratio Change
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIO_OPTIONS.slice(0, 4).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedAspectRatio(option.value)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedAspectRatio === option.value
                            ? 'border-blue-500 bg-blue-100 text-blue-700'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                    <input
                      type="range"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCropModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertImageManager;
