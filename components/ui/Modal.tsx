import React, { useEffect } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Product Quick View Modal
interface ProductQuickViewProps {
  gemstone: {
    id: number;
    name: string;
    type: string;
    price: number;
    images: string[];
    certification: string;
    description: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (id: number) => void;
  onViewFullDetails: (id: number) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  gemstone,
  isOpen,
  onClose,
  onAddToCart,
  onViewFullDetails,
}) => {
  const images = gemstone.images || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick View" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <img
            src={images[0] || '/placeholder-gemstone.jpg'}
            alt={gemstone.name}
            className="w-full h-64 object-cover rounded-lg"
          />
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${gemstone.name} ${idx + 2}`}
                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{gemstone.name}</h3>
            <p className="text-gray-600 mb-2">{gemstone.type}</p>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {gemstone.certification}
            </span>
          </div>

          <div className="text-3xl font-bold text-blue-800">${gemstone.price.toLocaleString()}</div>

          <p className="text-gray-700 leading-relaxed">{gemstone.description}</p>

          <div className="flex space-x-3 pt-4">
            <Button variant="primary" onClick={() => onAddToCart(gemstone.id)} className="flex-1">
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => onViewFullDetails(gemstone.id)}
              className="flex-1"
            >
              View Full Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}) => {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-800 hover:bg-blue-900',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        <div className="flex space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm} className={`flex-1 ${variants[variant]}`}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
