import React, { createContext, useContext, useEffect, useRef } from 'react';

interface AccessibilityContextType {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (elementId: string) => void;
  setPageTitle: (title: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      liveRegionRef.current.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement);
        }
      }, 1000);
    }
  };

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  };

  const setPageTitle = (title: string) => {
    document.title = title;
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content
      if (e.key === 'Tab' && e.shiftKey === false) {
        const skipLink = document.getElementById('skip-to-main');
        if (skipLink && document.activeElement === document.body) {
          skipLink.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        focusElement,
        setPageTitle,
      }}
    >
      {/* Live region for screen reader announcements */}
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

      {/* Skip links */}
      <nav aria-label="Skip navigation" className="sr-only focus:not-sr-only">
        <a
          id="skip-to-main"
          href="#main-content"
          className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        <a
          href="#search"
          className="absolute top-4 left-32 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to search
        </a>
        <a
          href="#cart"
          className="absolute top-4 left-48 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to cart
        </a>
      </nav>

      {children}
    </AccessibilityContext.Provider>
  );
};
