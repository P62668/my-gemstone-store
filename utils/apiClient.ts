// Centralized API client with throttling, retry logic, token refresh, and loading indicators
interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  throttleMs?: number;
  enableTokenRefresh?: boolean;
}

// Loading state handlers for UI indicators
type LoadingStartHandler = (key: string) => void;
type LoadingStopHandler = (key: string) => void;

// Global loading handlers that will be set by the app
let globalLoadingStartHandler: LoadingStartHandler | null = null;
let globalLoadingStopHandler: LoadingStopHandler | null = null;

// Set loading handlers from the LoadingContext
export const setLoadingHandlers = (
  startHandler: LoadingStartHandler,
  stopHandler: LoadingStopHandler
) => {
  globalLoadingStartHandler = startHandler;
  globalLoadingStopHandler = stopHandler;
};

interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private throttleMs: number;
  private enableTokenRefresh: boolean;
  private lastRequestTime: number = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.throttleMs = options.throttleMs || 100; // 100ms between requests
    this.enableTokenRefresh = options.enableTokenRefresh !== false; // Enable by default
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.throttleMs) {
      const delay = this.throttleMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.retries
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error.status === 429 && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await this.throttle();
          await request();
        } catch (error) {
          console.warn('API request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Attempt to refresh the access token using the refresh token
  private async refreshToken(): Promise<boolean> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = new Promise<boolean>(async (resolve) => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const success = response.ok;
        resolve(success);
        return success;
      } catch (error) {
        console.error('Token refresh failed:', error);
        resolve(false);
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw { status: 429, message: 'Rate limited' };
      }

      // Handle unauthorized error (expired token)
      if (response.status === 401 && this.enableTokenRefresh && url !== '/api/auth/refresh') {
        // Try to refresh the token
        const refreshSuccess = await this.refreshToken();
        
        if (refreshSuccess) {
          // Retry the original request with the new token
          return this.request<T>(url, options);
        }
      }

      // Try to parse response body for both success and error responses
      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
      } else {
        try {
          const text = await response.text();
          data = text ? text : null;
        } catch (e) {
          data = null;
        }
      }

      return {
        data,
        status: response.status,
        ok: response.ok,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw { status: 408, message: 'Request timeout' };
      }
      
      // Network or unexpected error — rethrow so retry logic can handle it
      throw error;
    }
  }

  async get<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Create a loading key based on the URL
    const loadingKey = `get:${url.split('?')[0]}`;
    
    // Start loading indicator
    if (globalLoadingStartHandler) {
      globalLoadingStartHandler(loadingKey);
    }
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.retryWithBackoff(() => 
            this.request<T>(url, { ...options, method: 'GET' })
          );
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Stop loading indicator
          if (globalLoadingStopHandler) {
            globalLoadingStopHandler(loadingKey);
          }
        }
      });

      this.processQueue();
    });
  }

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Create a loading key based on the URL
    const loadingKey = `post:${url}`;
    
    // Start loading indicator
    if (globalLoadingStartHandler) {
      globalLoadingStartHandler(loadingKey);
    }
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.retryWithBackoff(() => 
            this.request<T>(url, {
              ...options,
              method: 'POST',
              body: data ? JSON.stringify(data) : undefined,
            })
          );
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Stop loading indicator
          if (globalLoadingStopHandler) {
            globalLoadingStopHandler(loadingKey);
          }
        }
      });

      this.processQueue();
    });
  }

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Create a loading key based on the URL
    const loadingKey = `put:${url}`;
    
    // Start loading indicator
    if (globalLoadingStartHandler) {
      globalLoadingStartHandler(loadingKey);
    }
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.retryWithBackoff(() => 
            this.request<T>(url, {
              ...options,
              method: 'PUT',
              body: data ? JSON.stringify(data) : undefined,
            })
          );
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Stop loading indicator
          if (globalLoadingStopHandler) {
            globalLoadingStopHandler(loadingKey);
          }
        }
      });

      this.processQueue();
    });
  }

  async patch<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Create a loading key based on the URL
    const loadingKey = `patch:${url}`;
    
    // Start loading indicator
    if (globalLoadingStartHandler) {
      globalLoadingStartHandler(loadingKey);
    }
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.retryWithBackoff(() => 
            this.request<T>(url, {
              ...options,
              method: 'PATCH',
              body: data ? JSON.stringify(data) : undefined,
            })
          );
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Stop loading indicator
          if (globalLoadingStopHandler) {
            globalLoadingStopHandler(loadingKey);
          }
        }
      });

      this.processQueue();
    });
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Create a loading key based on the URL
    const loadingKey = `delete:${url}`;
    
    // Start loading indicator
    if (globalLoadingStartHandler) {
      globalLoadingStartHandler(loadingKey);
    }
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.retryWithBackoff(() => 
            this.request<T>(url, { ...options, method: 'DELETE' })
          );
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Stop loading indicator
          if (globalLoadingStopHandler) {
            globalLoadingStopHandler(loadingKey);
          }
        }
      });

      this.processQueue();
    });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient({
  baseURL: '',
  timeout: 10000,
  retries: 3,
  throttleMs: 200, // 200ms between requests
  enableTokenRefresh: true, // Enable token refresh by default
});

// Export the class for custom instances
export { ApiClient };
