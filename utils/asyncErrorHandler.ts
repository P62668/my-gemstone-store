import { logger } from './logger';
import toast from 'react-hot-toast';

export interface AsyncErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export interface AsyncResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Wrapper for async operations with error handling
 */
export async function handleAsync<T>(
  asyncOperation: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'Something went wrong. Please try again.',
    onError,
  } = options;

  try {
    const data = await asyncOperation();
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : fallbackMessage;
    
    if (logError) {
      logger.error('Async operation failed', undefined, error as Error);
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    return { data: null, error: errorMessage };
  }
}

/**
 * React hook for managing async operations with loading states
 */
export function useAsyncOperation<T>() {
  const [state, setState] = React.useState<AsyncResult<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = React.useCallback(
    async (
      asyncOperation: () => Promise<T>,
      options: AsyncErrorHandlerOptions = {}
    ) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await handleAsync(asyncOperation, options);
      
      setState({
        data: result.data,
        error: result.error,
        loading: false,
      });
      
      return result;
    },
    []
  );

  const reset = React.useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Higher-order component for wrapping components with error handling
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: AsyncErrorHandlerOptions = {}
) {
  return function WithErrorHandling(props: P) {
    const handleError = React.useCallback((error: Error) => {
      logger.error('Component error', undefined, error);
      
      if (options.showToast) {
        toast.error(options.fallbackMessage || 'Something went wrong');
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }, [options]);

    return React.createElement(ErrorBoundary, { onError: handleError, children: React.createElement(Component, props) });
  };
}

/**
 * Simple error boundary component
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React component error', error, {
      componentStack: errorInfo.componentStack,
    });
    
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return React.createElement('div', { 
        className: 'p-4 bg-red-50 border border-red-200 rounded-lg' 
      },
        React.createElement('div', { className: 'flex items-center' },
          React.createElement('svg', {
            className: 'w-5 h-5 text-red-400 mr-2',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            })
          ),
          React.createElement('span', { className: 'text-red-800' },
            'Something went wrong. Please try refreshing the page.'
          )
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Custom hook for API calls with automatic error handling
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
) {
  const [state, setState] = React.useState<AsyncResult<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const call = React.useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await handleAsync(
        () => apiFunction(...args),
        options
      );
      
      setState({
        data: result.data,
        error: result.error,
        loading: false,
      });
      
      return result;
    },
    [apiFunction, options]
  );

  return { ...state, call };
}

/**
 * Hook for form submission with error handling
 */
export function useFormSubmission<T>(
  submitFunction: (data: any) => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
) {
  const [state, setState] = React.useState<AsyncResult<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const submit = React.useCallback(
    async (formData: any) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await handleAsync(
        () => submitFunction(formData),
        {
          showToast: true,
          logError: true,
          fallbackMessage: 'Failed to submit form. Please try again.',
          ...options,
        }
      );
      
      setState({
        data: result.data,
        error: result.error,
        loading: false,
      });
      
      return result;
    },
    [submitFunction, options]
  );

  return { ...state, submit };
}

/**
 * Hook for data fetching with error handling
 */
export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
) {
  const [state, setState] = React.useState<AsyncResult<T>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetch = React.useCallback(
    async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await handleAsync(fetchFunction, {
        showToast: false, // Don't show toast for data fetching errors
        logError: true,
        fallbackMessage: 'Failed to load data.',
        ...options,
      });
      
      setState({
        data: result.data,
        error: result.error,
        loading: false,
      });
      
      return result;
    },
    [fetchFunction, options]
  );

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}

/**
 * Utility for handling specific error types
 */
export const errorHandlers = {
  network: (error: Error) => {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      toast.error('Network error. Please check your connection and try again.');
      return true;
    }
    return false;
  },
  
  validation: (error: Error) => {
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      toast.error('Please check your input and try again.');
      return true;
    }
    return false;
  },
  
  authentication: (error: Error) => {
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      toast.error('Please log in to continue.');
      return true;
    }
    return false;
  },
  
  server: (error: Error) => {
    if (error.message.includes('500') || error.message.includes('server')) {
      toast.error('Server error. Please try again later.');
      return true;
    }
    return false;
  },
};

/**
 * Enhanced error handler with specific error type detection
 */
export async function handleAsyncWithTypeDetection<T>(
  asyncOperation: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data: T | null; error: string | null; errorType?: string }> {
  const result = await handleAsync(asyncOperation, { ...options, showToast: false });
  
  if (result.error) {
    const error = new Error(result.error);
    let handled = false;
    
    // Try specific error handlers
    for (const [type, handler] of Object.entries(errorHandlers)) {
      if (handler(error)) {
        handled = true;
        break;
      }
    }
    
    // Fallback to generic error
    if (!handled && options.showToast) {
      toast.error(result.error);
    }
    
    return { ...result, errorType: handled ? 'specific' : 'generic' };
  }
  
  return result;
}

// Import React for the hooks
import React from 'react';
